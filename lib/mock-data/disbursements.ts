import { DisbursementRecord } from "../types/pema";

export const initialDisbursements: DisbursementRecord[] = [
  {
    id: "disb-001",
    disbursementCode: "DISB-2569-0012",
    requestId: "req-002",
    requestCode: "REQ-2569-0008",
    projectTitle: "โครงการประชุมวิชาการระดับชาติและนานาชาติด้านวิทยาการคอมพิวเตอร์และนวัตกรรมดิจิทัล (JCSID 2026)",
    department: "ภาควิชาวิทยาการคอมพิวเตอร์",
    requesterName: "ศ.ดร. ภาณุวัฒน์ กานต์พานิช",
    status: "paid",
    totalApprovedBudget: 285000,
    totalActualAmount: 282400,
    remainingBalance: 2600,
    payeeName: "ศูนย์ประชุมนานาชาติ / ผู้จัดงาน",
    bankAccount: "ธนาคารกรุงไทย สาขามหาวิทยาลัย 123-4-56789-0",
    createdAt: "2026-08-19T09:00:00Z",
    updatedAt: "2026-08-22T15:00:00Z",
    paidAt: "2026-08-22T15:00:00Z",
    note: "แนบใบเสร็จค่าสถานที่และค่าวิทยากรครบถ้วน งบประมาณคงเหลือคืนเข้ากองทุน",
    items: [
      {
        id: "d-item-1",
        expenseItemId: "exp-201",
        category: "ค่าสถานที่และอุปกรณ์",
        description: "ค่าเช่าห้องประชุมใหญ่และอุปกรณ์โสตทัศนูปกรณ์ (3 วัน)",
        budgetAllocated: 75000,
        actualAmount: 75000,
        invoiceNo: "INV-HALL-2026-099",
        receiptDate: "2026-08-19",
        vendorName: "ศูนย์ประชุมนานาชาติเฉลิมพระเกียรติ"
      },
      {
        id: "d-item-2",
        expenseItemId: "exp-202",
        category: "ค่าสมนาคุณวิทยากร",
        description: "ค่าตอบแทน Keynote Speakers",
        budgetAllocated: 60000,
        actualAmount: 60000,
        invoiceNo: "RCPT-SPK-01",
        receiptDate: "2026-08-20",
        vendorName: "Prof. Dr. Hiroshi Tanaka"
      },
      {
        id: "d-item-3",
        expenseItemId: "exp-203",
        category: "ค่าอาหารและเครื่องดื่ม",
        description: "ค่าอาหารกลางวันและคอฟฟี่เบรกสำหรับผู้ร่วมงาน (200 คน)",
        budgetAllocated: 150000,
        actualAmount: 147400,
        invoiceNo: "INV-CAT-8891",
        receiptDate: "2026-08-21",
        vendorName: "ร้านแคทเทอริ่งอินเตอร์เนชั่นแนล"
      }
    ]
  },
  {
    id: "disb-002",
    disbursementCode: "DISB-2569-0018",
    requestId: "req-005",
    requestCode: "REQ-2569-0005",
    projectTitle: "โครงการยกระดับผลิตภัณฑ์สมุนไพรท้องถิ่นสู่มาตรฐานสากลด้วยงานวิจัยและนวัตกรรมชุมชน",
    department: "ศูนย์นวัตกรรมสมุนไพรและแพทย์แผนไทย",
    requesterName: "ผศ.ดร. รุจิรา บุญชู",
    status: "paid",
    totalApprovedBudget: 50000,
    totalActualAmount: 49850,
    remainingBalance: 150,
    payeeName: "ผศ.ดร. รุจิรา บุญชู (ยืมทดรองจ่าย)",
    bankAccount: "ธนาคารไทยพาณิชย์ 456-7-89012-3",
    createdAt: "2026-08-16T10:00:00Z",
    updatedAt: "2026-08-19T17:00:00Z",
    paidAt: "2026-08-19T17:00:00Z",
    note: "จ่ายชดใช้เงินยืมทดรองจ่ายตามใบเสร็จจริง",
    items: [
      {
        id: "d-item-201",
        expenseItemId: "exp-501",
        category: "ค่าวัสดุและสารเคมี",
        description: "สารเคมีและบรรจุภัณฑ์สำหรับการผลิตต้นแบบ",
        budgetAllocated: 35000,
        actualAmount: 34850,
        invoiceNo: "REC-CHEM-5512",
        receiptDate: "2026-08-16",
        vendorName: "บจก. เคมีภัณฑ์ไทย"
      },
      {
        id: "d-item-202",
        expenseItemId: "exp-502",
        category: "ค่าสมนาคุณวิทยากร",
        description: "ค่าตอบแทนวิทยากรผู้เชี่ยวชาญด้านมาตรฐาน GMP",
        budgetAllocated: 15000,
        actualAmount: 15000,
        invoiceNo: "REC-HON-09",
        receiptDate: "2026-08-17",
        vendorName: "ภก. ชัยวัฒน์ เกียรติสกุล"
      }
    ]
  }
];
