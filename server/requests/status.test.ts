import { describe, expect, it } from "vitest";
import { RequestStatus, UserRole } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { assertCanReview, assertEditable, nextApprovedStatus } from "@/server/requests/status";

describe("PEMA request status workflow", () => {
  it("moves through the approval chain in order", () => {
    expect(nextApprovedStatus(RequestStatus.PENDING_FINANCE)).toBe(RequestStatus.PENDING_DIRECTOR);
    expect(nextApprovedStatus(RequestStatus.PENDING_DIRECTOR)).toBe(RequestStatus.PENDING_DEAN);
    expect(nextApprovedStatus(RequestStatus.PENDING_DEAN)).toBe(RequestStatus.PENDING_VICE_RECTOR);
    expect(nextApprovedStatus(RequestStatus.PENDING_VICE_RECTOR)).toBe(RequestStatus.PENDING_RECTOR);
    expect(nextApprovedStatus(RequestStatus.PENDING_RECTOR)).toBe(RequestStatus.FULLY_APPROVED);
  });

  it("rejects an approver from the wrong role", () => {
    expect(() => assertCanReview(RequestStatus.PENDING_FINANCE, UserRole.DIRECTOR)).toThrow(ApiError);
  });

  it("allows only draft and returned requests to be edited", () => {
    expect(() => assertEditable(RequestStatus.DRAFT)).not.toThrow();
    expect(() => assertEditable(RequestStatus.RETURNED)).not.toThrow();
    expect(() => assertEditable(RequestStatus.FULLY_APPROVED)).toThrow(ApiError);
  });
});
