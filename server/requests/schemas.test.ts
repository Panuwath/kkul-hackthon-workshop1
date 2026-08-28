import { describe, expect, it } from "vitest";
import { createRequestSchema, reviewRequestSchema } from "@/server/requests/schemas";

const validRequest = {
  projectName: "โครงการอบรมตัวอย่าง",
  projectType: "training",
  organizerDepartment: "หน่วยงานตัวอย่าง",
  startDate: "2026-09-01",
  endDate: "2026-09-02",
  location: "มหาวิทยาลัยขอนแก่น",
  venueType: "ภายในมหาวิทยาลัย",
  participants: 30,
  attendanceFeeMode: "ไม่เก็บ",
  items: [],
};

describe("PEMA request boundary validation", () => {
  it("rejects an end date before the start date", () => {
    const result = createRequestSchema.safeParse({ ...validRequest, endDate: "2026-08-31" });
    expect(result.success).toBe(false);
  });

  it("requires a reason when a reviewer returns a request", () => {
    const result = reviewRequestSchema.safeParse({ version: 1, decision: "return" });
    expect(result.success).toBe(false);
  });

  it("accepts decimal expense inputs and leaves total calculation to the server", () => {
    const result = createRequestSchema.safeParse({
      ...validRequest,
      items: [{ category: "อาหาร", quantity: 2, unit: "คน", unitPrice: 125.5 }],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items[0].isV119).toBe(false);
  });
});
