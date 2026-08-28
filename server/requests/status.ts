import { RequestStatus, UserRole } from "@prisma/client";
import { ApiError } from "@/lib/api";

const reviewRoleByStatus: Partial<Record<RequestStatus, UserRole>> = {
  [RequestStatus.PENDING_FINANCE]: UserRole.FINANCE,
  [RequestStatus.PENDING_DIRECTOR]: UserRole.DIRECTOR,
  [RequestStatus.PENDING_DEAN]: UserRole.DEAN,
  [RequestStatus.PENDING_VICE_RECTOR]: UserRole.VICE_RECTOR,
  [RequestStatus.PENDING_RECTOR]: UserRole.RECTOR,
};

export function canViewAllRequests(role: UserRole): boolean {
  return role !== UserRole.STAFF;
}

export function assertCanReview(status: RequestStatus, role: UserRole): void {
  if (role === UserRole.ADMIN) return;
  if (reviewRoleByStatus[status] !== role) {
    throw new ApiError(403, "FORBIDDEN", "This role cannot review the current request status");
  }
}

export function nextApprovedStatus(status: RequestStatus): RequestStatus {
  const next: Partial<Record<RequestStatus, RequestStatus>> = {
    [RequestStatus.PENDING_FINANCE]: RequestStatus.PENDING_DIRECTOR,
    [RequestStatus.PENDING_DIRECTOR]: RequestStatus.PENDING_DEAN,
    [RequestStatus.PENDING_DEAN]: RequestStatus.PENDING_VICE_RECTOR,
    [RequestStatus.PENDING_VICE_RECTOR]: RequestStatus.PENDING_RECTOR,
    [RequestStatus.PENDING_RECTOR]: RequestStatus.FULLY_APPROVED,
  };
  const nextStatus = next[status];
  if (!nextStatus) throw new ApiError(409, "CONFLICT", "The request cannot be approved from its current status");
  return nextStatus;
}

export function assertEditable(status: RequestStatus): void {
  if (status !== RequestStatus.DRAFT && status !== RequestStatus.RETURNED) {
    throw new ApiError(409, "CONFLICT", "Only draft or returned requests can be edited");
  }
}
