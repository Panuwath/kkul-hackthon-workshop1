import { DashboardMetrics, PemaRequest } from "./types/pema";

export function getDashboardMetrics(requests: PemaRequest[]): DashboardMetrics {
  const pending = requests.filter((request) => request.status === "pending_approval");
  const approved = requests.filter((request) => request.status === "approved");
  const returned = requests.filter((request) => request.status === "returned");
  const totalRequested = requests.reduce((sum, request) => sum + request.totalBudget, 0);
  const totalApproved = approved.reduce((sum, request) => sum + request.totalBudget, 0);
  const actionRequiredItems = requests.filter(
    (request) => request.status === "returned" || request.status === "pending_approval",
  );

  return {
    totalRequests: requests.length,
    pendingApprovalCount: pending.length,
    approvedCount: approved.length,
    returnedCount: returned.length,
    totalBudgetRequested: totalRequested,
    totalBudgetApproved: totalApproved,
    actionRequiredItems,
  };
}
