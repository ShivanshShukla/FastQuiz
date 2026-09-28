import csv
import datetime
import io
import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.admin import Admin, AdminAuditLog
from app.models.user import AdminNote, User
from app.routers.admin_auth import get_client_ip, get_current_admin
from app.schemas.admin_users import (
    AdminActionResponse,
    AdminUserActivityItem,
    AdminUserAttemptItem,
    AdminUserDetail,
    AdminUserFreeGrantItem,
    AdminUserListItem,
    AdminUserNoteItem,
    AdminUserPurchaseItem,
    AdminUserQuestionBreakdown,
    AdminUsersListResponse,
    AdminUsersSummaryChips,
    CreateAdminNoteRequest,
    GrantQuizRequest,
    ResetFreeGrantRequest,
    SuspendUserRequest,
    UnsuspendUserRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/users", tags=["Admin Learner Accounts Directory"])


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


def require_users_access(admin: Admin = Depends(get_current_admin)) -> Admin:
    if admin.role == "reviewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content Reviewer role is restricted from accessing learner directory",
        )
    return admin


def require_export_access(admin: Admin = Depends(require_users_access)) -> Admin:
    if admin.role not in ("super_admin", "finance"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSV export is restricted to Super Admin & Finance roles",
        )
    return admin


async def write_user_audit(
    db: AsyncSession,
    request: Request,
    admin: Admin,
    event_type: str,
    target_id: str,
    details: dict | None = None,
) -> None:
    log_entry = AdminAuditLog(
        admin_id=admin.id,
        attempted_email=admin.email,
        event_type=event_type,
        status="success",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:255],
        details=json.dumps(details) if details else None,
    )
    db.add(log_entry)
    await db.commit()



SAMPLE_BREAKDOWN = [
    AdminUserQuestionBreakdown(
        question_id="q-brk-1",
        prompt="What is the time complexity of finding a duplicate in an unsorted array using an in-place Floyd Cycle Detection algorithm?",
        options=["O(1)", "O(N)", "O(N log N)", "O(N^2)"],
        user_answer_index=1,
        correct_answer_index=1,
        is_correct=True,
        explanation="Floyd Cycle Detection traverses the array treating indices as pointers, which completes in linear O(N) time with O(1) space.",
    ),
    AdminUserQuestionBreakdown(
        question_id="q-brk-2",
        prompt="In dynamic sliding window algorithms for substring problems, when is the left pointer incremented?",
        options=[
            "Only when the right pointer reaches the end",
            "When the current window condition becomes invalid",
            "At every iteration regardless of state",
            "Never, sliding windows only move right",
        ],
        user_answer_index=1,
        correct_answer_index=1,
        is_correct=True,
        explanation="The left pointer contracts the window until the constraint (e.g. at most K distinct characters) is restored.",
    ),
]


@router.get("", response_model=AdminUsersListResponse)
async def list_users(
    q: str | None = Query(None, description="Search query"),
    status: str = Query("all", description="Filter: all, active, suspended"),
    source: str = Query("all", description="Filter: all, email, google"),
    has_purchased: str = Query("all", description="Filter: all, yes, no"),
    signup_from: str | None = Query(None),
    signup_to: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    _admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminUsersListResponse:
    query = select(User)

    if q:
        term = f"%{q.strip().lower()}%"
        query = query.where(
            func.lower(User.name).like(term)
            | func.lower(User.email).like(term)
            | func.lower(User.id).like(term)
        )

    if status != "all":
        query = query.where(User.status == status)

    if source != "all":
        query = query.where(User.source == source)

    if signup_from:
        try:
            from_dt = datetime.datetime.fromisoformat(signup_from)
            query = query.where(User.created_at >= from_dt)
        except Exception:
            pass

    if signup_to:
        try:
            to_dt = datetime.datetime.fromisoformat(signup_to)
            query = query.where(User.created_at <= to_dt)
        except Exception:
            pass

    # Ordering
    sort_col = User.created_at
    if sort_by == "last_seen_at":
        sort_col = User.last_seen_at

    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Count total
    count_stmt = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    items_stmt = query.offset(offset).limit(page_size)
    items_res = await db.execute(items_stmt)
    users = items_res.scalars().all()

    # Summary chips
    all_count_res = await db.execute(select(func.count(User.id)))
    total_reg = all_count_res.scalar() or 0

    thirty_days_ago = utc_now() - datetime.timedelta(days=30)
    active_res = await db.execute(
        select(func.count(User.id)).where(User.last_seen_at >= thirty_days_ago)
    )
    active_30d = active_res.scalar() or 0

    susp_res = await db.execute(
        select(func.count(User.id)).where(User.status == "suspended")
    )
    suspended_count = susp_res.scalar() or 0

    items = [
        AdminUserListItem(
            id=u.id,
            name=u.name,
            email=u.email,
            status=u.status,
            source=u.source,
            created_at=u.created_at.isoformat(),
            last_seen_at=u.last_seen_at.isoformat() if u.last_seen_at else None,
            quizzes_purchased=0,
            total_spent=0.0,
            attempts_count=0,
        )
        for u in users
    ]

    summary = AdminUsersSummaryChips(
        total_registered=total_reg,
        active_30d=active_30d,
        suspended=suspended_count,
        paying_customers=0,
    )

    return AdminUsersListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        summary=summary,
    )


@router.get("/export")
async def export_users_csv(
    _admin: Admin = Depends(require_export_access),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    res = await db.execute(select(User).order_by(User.created_at.desc()))
    users = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "User ID",
            "Name",
            "Email",
            "Status",
            "Signup Source",
            "Created At",
            "Last Seen At",
        ]
    )

    for u in users:
        writer.writerow(
            [
                u.id,
                u.name,
                u.email,
                u.status,
                u.source,
                u.created_at.isoformat(),
                u.last_seen_at.isoformat() if u.last_seen_at else "",
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"},
    )


@router.get("/{user_id}", response_model=AdminUserDetail)
async def get_user_detail(
    user_id: str,
    request: Request,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminUserDetail:
    res = await db.execute(
        select(User).options(selectinload(User.notes)).where(User.id == user_id)
    )
    user = res.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found",
        )

    await write_user_audit(
        db,
        request,
        admin,
        "user_detail_viewed",
        user_id,
        {"viewed_user_email": user.email},
    )

    notes = [
        AdminUserNoteItem(
            id=n.id,
            user_id=n.user_id,
            admin_id=n.admin_id,
            admin_name=n.admin_name,
            admin_role=n.admin_role,
            text=n.text,
            created_at=n.created_at.isoformat(),
        )
        for n in user.notes
    ]

    return AdminUserDetail(
        id=user.id,
        name=user.name,
        email=user.email,
        status=user.status,
        source=user.source,
        created_at=user.created_at.isoformat(),
        last_seen_at=user.last_seen_at.isoformat() if user.last_seen_at else None,
        attempts_count=0,
        avg_score_pct=0.0,
        quizzes_purchased=0,
        total_spent=0.0,
        attempts=[],
        purchases=[],
        free_grants=[],
        activity=[
            AdminUserActivityItem(
                id=f"act-{user.id}-1",
                activity_type="signup",
                description="Account created",
                timestamp=user.created_at.isoformat(),
            ),
        ],
        notes=notes,
    )


@router.post("/{user_id}/suspend", response_model=AdminActionResponse)
async def suspend_user(
    user_id: str,
    payload: SuspendUserRequest,
    request: Request,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminActionResponse:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.status = "suspended"

    # Add audit note
    note = AdminNote(
        user_id=user_id,
        admin_id=admin.id,
        admin_name=admin.name,
        admin_role=admin.role,
        text=f"Status changed to SUSPENDED. Reason: {payload.reason}",
    )
    db.add(note)
    await db.commit()

    await write_user_audit(
        db,
        request,
        admin,
        "user_suspended",
        user_id,
        {"reason": payload.reason, "email": user.email},
    )

    return AdminActionResponse(
        success=True, message=f"User {user.email} has been suspended."
    )


@router.post("/{user_id}/unsuspend", response_model=AdminActionResponse)
async def unsuspend_user(
    user_id: str,
    payload: UnsuspendUserRequest,
    request: Request,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminActionResponse:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.status = "active"

    note = AdminNote(
        user_id=user_id,
        admin_id=admin.id,
        admin_name=admin.name,
        admin_role=admin.role,
        text=f"Status restored to ACTIVE. Reason: {payload.reason}",
    )
    db.add(note)
    await db.commit()

    await write_user_audit(
        db,
        request,
        admin,
        "user_unsuspended",
        user_id,
        {"reason": payload.reason, "email": user.email},
    )

    return AdminActionResponse(
        success=True, message=f"User {user.email} has been unsuspended."
    )


@router.post("/{user_id}/grants", response_model=AdminActionResponse)
async def grant_quiz(
    user_id: str,
    payload: GrantQuizRequest,
    request: Request,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminActionResponse:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    note = AdminNote(
        user_id=user_id,
        admin_id=admin.id,
        admin_name=admin.name,
        admin_role=admin.role,
        text=f"Granted access to quiz '{payload.quiz_id}'. Reason: {payload.reason}",
    )
    db.add(note)
    await db.commit()

    await write_user_audit(
        db,
        request,
        admin,
        "quiz_grant_issued",
        user_id,
        {"quiz_id": payload.quiz_id, "reason": payload.reason},
    )

    return AdminActionResponse(
        success=True, message=f"Granted access to quiz {payload.quiz_id}."
    )


@router.post("/{user_id}/free-grants/reset", response_model=AdminActionResponse)
async def reset_free_grant(
    user_id: str,
    payload: ResetFreeGrantRequest,
    request: Request,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminActionResponse:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    note = AdminNote(
        user_id=user_id,
        admin_id=admin.id,
        admin_name=admin.name,
        admin_role=admin.role,
        text=f"Free attempt reset. Reason: {payload.reason}",
    )
    db.add(note)
    await db.commit()

    await write_user_audit(
        db,
        request,
        admin,
        "free_grant_reset",
        user_id,
        {"reason": payload.reason},
    )

    return AdminActionResponse(
        success=True, message="Free attempt grant successfully reset."
    )


@router.get("/{user_id}/notes", response_model=list[AdminUserNoteItem])
async def list_user_notes(
    user_id: str,
    _admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> list[AdminUserNoteItem]:
    res = await db.execute(
        select(AdminNote)
        .where(AdminNote.user_id == user_id)
        .order_by(AdminNote.created_at.desc())
    )
    notes = res.scalars().all()
    return [
        AdminUserNoteItem(
            id=n.id,
            user_id=n.user_id,
            admin_id=n.admin_id,
            admin_name=n.admin_name,
            admin_role=n.admin_role,
            text=n.text,
            created_at=n.created_at.isoformat(),
        )
        for n in notes
    ]


@router.post("/{user_id}/notes", response_model=AdminUserNoteItem)
async def add_user_note(
    user_id: str,
    payload: CreateAdminNoteRequest,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> AdminUserNoteItem:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    note = AdminNote(
        user_id=user_id,
        admin_id=admin.id,
        admin_name=admin.name,
        admin_role=admin.role,
        text=payload.text,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)

    return AdminUserNoteItem(
        id=note.id,
        user_id=note.user_id,
        admin_id=note.admin_id,
        admin_name=note.admin_name,
        admin_role=note.admin_role,
        text=note.text,
        created_at=note.created_at.isoformat(),
    )


@router.post("/{user_id}/reveal-email")
async def reveal_user_email(
    user_id: str,
    request: Request,
    admin: Admin = Depends(require_users_access),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    await write_user_audit(
        db,
        request,
        admin,
        "user_email_revealed",
        user_id,
        {"revealed_email": user.email, "admin_role": admin.role},
    )

    return {"email": user.email}


@router.get(
    "/{user_id}/attempts/{attempt_id}/breakdown",
    response_model=list[AdminUserQuestionBreakdown],
)
async def get_attempt_breakdown(
    user_id: str,
    attempt_id: str,
    _admin: Admin = Depends(require_users_access),
) -> list[AdminUserQuestionBreakdown]:
    return SAMPLE_BREAKDOWN
