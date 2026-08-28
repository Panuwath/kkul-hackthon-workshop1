import { PemaRequest, DashboardMetrics } from "../types/pema";

export const initialRequests: PemaRequest[] = [
  {
    id: "req-001",
    code: "REQ-2569-0012",
    title: "โครงการอบรมเชิงปฏิบัติการพัฒนาทักษะปัญญาประดิษฐ์ (Generative AI) สำหรับอาจารย์และบุคลากร",
    category: "training",
    department: "ฝ่ายเทคโนโลยีสารสนเทศและการสื่อสาร",
    faculty: "สำนักบริการคอมพิวเตอร์",
    requesterName: "ดร. กิตติศักดิ์ พรหมมินทร์",
    requesterRole: "นักวิชาการคอมพิวเตอร์ชำนาญการ",
    requesterEmail: "kittisak.p@univ.ac.th",
    requesterPhone: "081-234-5678",
    createdAt: "2026-08-20T08:30:00Z",
    updatedAt: "2026-08-22T14:15:00Z",
    status: "pending_approval",
    startDate: "2026-09-15",
    endDate: "2026-09-16",
    location: "ห้องอบรมคอมพิวเตอร์ 401 อาคารศูนย์สารสนเทศ",
    targetAudienceCount: 45,
    objectives: [
      "เพื่อเสริมสร้างทักษะการประยุกต์ใช้ Generative AI ในการจัดการเรียนการสอนและการวิจัย",
      "เพื่อพัฒนาประสิทธิภาพการปฏิบัติงานของบุคลากรสายสนับสนุนด้วยเครื่องมือ AI อัตโนมัติ",
      "เพื่อสร้างเครือข่ายความร่วมมือด้านนวัตกรรมดิจิทัลภายในสถาบัน"
    ],
    rationale: "ปัจจุบันเทคโนโลยี Generative AI มีบทบาทสำคัญอย่างยิ่งต่อการขับเคลื่อนการศึกษาและการทำงาน การพัฒนาทักษะนี้จะช่วยเพิ่มศักยภาพของบุคลากรให้ก้าวทันเทคโนโลยีสมัยใหม่ตามแผนยุทธศาสตร์ดิจิทัล",
    expectedOutcomes: [
      "ผู้เข้าร่วมอบรมร้อยละ 85 มีความรู้ความเข้าใจและสามารถนำเครื่องมือ AI ไปใช้งานได้จริง",
      "เกิดผลงานต้นแบบหรือสื่อการสอนประยุกต์อย่างน้อย 1 ชิ้นต่อผู้เข้าอบรม"
    ],
    strategicPlan: "ยุทธศาสตร์ที่ 1: การพลิกโฉมการศึกษาและพัฒนาทักษะแห่งอนาคต (Future Skills)",
    kpiAlignment: "KPI 1.2: สัดส่วนบุคลากรที่ได้รับการอบรมด้านทักษะดิจิทัลขั้นสูงไม่น้อยกว่า 70%",
    sustainableGoal: "SDG 4: การศึกษาที่มีคุณภาพ (Quality Education)",
    expenses: [
      {
        id: "exp-1",
        category: "honorarium",
        description: "ค่าสมนาคุณวิทยากรผู้ทรงคุณวุฒิภายนอก (2 ท่าน x 6 ชม.)",
        unitPrice: 1500,
        quantity: 12,
        unit: "ชั่วโมง",
        total: 18000,
        capLimit: 1500,
        capWarning: "อัตราตามระเบียบราชการไม่เกิน 1,500 บ./ชม."
      },
      {
        id: "exp-2",
        category: "food",
        description: "ค่าอาหารกลางวัน (45 คน x 2 มื้อ)",
        unitPrice: 120,
        quantity: 90,
        unit: "มื้อ",
        total: 10800,
        capLimit: 150,
      },
      {
        id: "exp-3",
        category: "food",
        description: "ค่าอาหารว่างและเครื่องดื่ม (45 คน x 4 มื้อ)",
        unitPrice: 50,
        quantity: 180,
        unit: "มื้อ",
        total: 9000,
        capLimit: 50,
        capWarning: "เพดานอัตราอาหารว่างสูงสุด 50 บ./คน/มื้อ"
      },
      {
        id: "exp-4",
        category: "material",
        description: "ค่าวัสดุและเอกสารประกอบการอบรม (แฟลชไดรฟ์+คู่มือ)",
        unitPrice: 150,
        quantity: 45,
        unit: "ชุด",
        total: 6750
      }
    ],
    speakers: [
      {
        id: "spk-1",
        name: "รศ.ดร. นันทิยา พิริยพันธุ์",
        position: "อาจารย์ประจำภาควิชาวิศวกรรมคอมพิวเตอร์",
        organization: "สถาบันวิจัยปัญญาประดิษฐ์แห่งชาติ",
        type: "external",
        topic: "Prompt Engineering and LLM Fine-Tuning for Academic Work",
        hours: 6,
        ratePerHour: 1500,
        totalHonorarium: 9000
      },
      {
        id: "spk-2",
        name: "ผศ. อัครเดช ธนศักดิ์",
        position: "ผู้เชี่ยวชาญด้านระบบอัตโนมัติ",
        organization: "บริษัท เทคอินโนเวชั่น จำกัด",
        type: "external",
        topic: "Building AI Workflows with Open Source Models",
        hours: 6,
        ratePerHour: 1500,
        totalHonorarium: 9000
      }
    ],
    attachments: [
      {
        id: "att-1",
        fileName: "TOR_โครงการอบรม_AI_2569.pdf",
        fileSize: "2.4 MB",
        fileType: "application/pdf",
        uploadedAt: "2026-08-20T08:35:00Z",
        category: "tor"
      },
      {
        id: "att-2",
        fileName: "กำหนดการอบรม_AI_Workshop.pdf",
        fileSize: "450 KB",
        fileType: "application/pdf",
        uploadedAt: "2026-08-20T08:36:00Z",
        category: "schedule"
      }
    ],
    totalBudget: 44550,
    timeline: [
      {
        id: "tl-1",
        stepName: "ยื่นเสนอคำขอโครงการ",
        actorName: "ดร. กิตติศักดิ์ พรหมมินทร์",
        actorRole: "ผู้รับผิดชอบโครงการ",
        status: "completed",
        timestamp: "2026-08-20 08:30:00",
        comment: "ยื่นคำขอพร้อมเอกสารแนบครบถ้วน"
      },
      {
        id: "tl-2",
        stepName: "การตรวจสอบของหัวหน้าหน่วยงาน",
        actorName: "นายสมเกียรติ มงคลรัตน์",
        actorRole: "หัวหน้าฝ่ายเทคโนโลยีสารสนเทศ",
        status: "completed",
        timestamp: "2026-08-21 11:20:00",
        comment: "เห็นชอบในหลักการและงบประมาณ เสนอพิจารณาอนุมัติ"
      },
      {
        id: "tl-3",
        stepName: "การพิจารณาด้านงบประมาณและการเงิน",
        actorName: "นางสาวศิริพร บุญเจริญ",
        actorRole: "หัวหน้างานวิเคราะห์งบประมาณ",
        status: "current",
        timestamp: "2026-08-22 14:15:00",
        comment: "อยู่ระหว่างการตรวจอัตราค่าใช้จ่ายตามระเบียบ"
      },
      {
        id: "tl-4",
        stepName: "การอนุมัติขั้นสุดท้าย",
        actorName: "ศ.ดร. ธนกฤต วิทยานุกูล",
        actorRole: "รองอธิการบดีฝ่ายวางแผนและเทคโนโลยี",
        status: "pending"
      }
    ],
    allowedActions: ["approve", "return", "reject"]
  },
  {
    id: "req-002",
    code: "REQ-2569-0008",
    title: "โครงการประชุมวิชาการระดับชาติและนานาชาติด้านวิทยาการคอมพิวเตอร์และนวัตกรรมดิจิทัล (JCSID 2026)",
    category: "research",
    department: "ภาควิชาวิทยาการคอมพิวเตอร์",
    faculty: "คณะวิทยาศาสตร์",
    requesterName: "ศ.ดร. ภาณุวัฒน์ กานต์พานิช",
    requesterRole: "ประธานหลักสูตรปริญญาเอก",
    requesterEmail: "panuwat.k@univ.ac.th",
    requesterPhone: "089-987-6543",
    createdAt: "2026-08-10T10:00:00Z",
    updatedAt: "2026-08-18T16:00:00Z",
    status: "approved",
    startDate: "2026-10-08",
    endDate: "2026-10-10",
    location: "ศูนย์ประชุมนานาชาติเฉลิมพระเกียรติ",
    targetAudienceCount: 200,
    objectives: [
      "เพื่อเผยแพร่ผลงานวิจัยระดับแนวหน้าสู่เวทีระดับนานาชาติ",
      "เพื่อส่งเสริมความร่วมมือด้านการตีพิมพ์ผลงานวิจัยในฐานข้อมูล Scopus/IEEE",
      "เพื่อแลกเปลี่ยนความรู้ระหว่างนักวิจัยในประเทศและผู้เชี่ยวชาญจากต่างประเทศ"
    ],
    rationale: "การจัดประชุมวิชาการนานาชาติเป็นการสร้างชื่อเสียงทางวิชาการและเพิ่มขีดความสามารถการแข่งขันของสถาบันในเวทีสากล",
    expectedOutcomes: [
      "มีบทความวิจัยที่ผ่านการคัดกรองและตีพิมพ์ใน Proceedings นานาชาติอย่างน้อย 60 บทความ",
      "เกิดข้อตกลงความร่วมมือวิจัยร่วมกับมหาวิทยาลัยในต่างประเทศอย่างน้อย 2 สถาบัน"
    ],
    strategicPlan: "ยุทธศาสตร์ที่ 2: การวิจัยขั้นแนวหน้าและสร้างนวัตกรรมที่ส่งผลกระทบสูง (Frontier Research)",
    kpiAlignment: "KPI 2.1: จำนวนบทความวิจัยระดับนานาชาติที่ตีพิมพ์ในฐานข้อมูลชั้นนำ",
    sustainableGoal: "SDG 9: อุตสาหกรรม นวัตกรรม และโครงสร้างพื้นฐาน",
    expenses: [
      {
        id: "exp-201",
        category: "venue",
        description: "ค่าเช่าห้องประชุมใหญ่และอุปกรณ์โสตทัศนูปกรณ์ (3 วัน)",
        unitPrice: 25000,
        quantity: 3,
        unit: "วัน",
        total: 75000
      },
      {
        id: "exp-202",
        category: "honorarium",
        description: "ค่าตอบแทน Keynote Speakers จากต่างประเทศ (3 ท่าน)",
        unitPrice: 20000,
        quantity: 3,
        unit: "ท่าน",
        total: 60000
      },
      {
        id: "exp-203",
        category: "food",
        description: "ค่าอาหารกลางวันและคอฟฟี่เบรกสำหรับผู้ร่วมงาน (200 คน x 3 วัน)",
        unitPrice: 250,
        quantity: 600,
        unit: "มื้อ",
        total: 150000
      }
    ],
    speakers: [
      {
        id: "spk-201",
        name: "Prof. Dr. Hiroshi Tanaka",
        position: "Director of Institute for Intelligent Systems",
        organization: "Tokyo University, Japan",
        type: "external",
        topic: "Next-Generation Autonomous Systems in Healthcare",
        hours: 3,
        ratePerHour: 6666.67,
        totalHonorarium: 20000
      }
    ],
    attachments: [
      {
        id: "att-201",
        fileName: "JCSID_Conference_Proposal_Approved.pdf",
        fileSize: "5.1 MB",
        fileType: "application/pdf",
        uploadedAt: "2026-08-10T10:05:00Z",
        category: "tor"
      }
    ],
    totalBudget: 285000,
    timeline: [
      {
        id: "tl-201",
        stepName: "ยื่นเสนอคำขอโครงการ",
        actorName: "ศ.ดร. ภาณุวัฒน์ กานต์พานิช",
        actorRole: "ผู้รับผิดชอบโครงการ",
        status: "completed",
        timestamp: "2026-08-10 10:00:00"
      },
      {
        id: "tl-202",
        stepName: "การตรวจสอบของหัวหน้าหน่วยงาน",
        actorName: "ศ.ดร. บุญส่ง สมิตานนท์",
        actorRole: "คณบดีคณะวิทยาศาสตร์",
        status: "completed",
        timestamp: "2026-08-12 15:30:00",
        comment: "เห็นควรสนับสนุนอย่างยิ่ง เพื่อยกระดับงานวิจัยสากล"
      },
      {
        id: "tl-203",
        stepName: "การพิจารณาด้านงบประมาณและการเงิน",
        actorName: "นางสาวศิริพร บุญเจริญ",
        actorRole: "หัวหน้างานวิเคราะห์งบประมาณ",
        status: "completed",
        timestamp: "2026-08-15 09:40:00",
        comment: "ตรวจสอบแหล่งเงินจากกองทุนพัฒนาวิชาการ ถูกต้องตามเกณฑ์"
      },
      {
        id: "tl-204",
        stepName: "การอนุมัติขั้นสุดท้าย",
        actorName: "รศ.ดร. วิจิตร ประภัสสร",
        actorRole: "อธิการบดี",
        status: "completed",
        timestamp: "2026-08-18 16:00:00",
        comment: "อนุมัติดำเนินโครงการตามวงเงินงบประมาณที่เสนอ"
      }
    ],
    allowedActions: ["disburse", "cancel"]
  },
  {
    id: "req-003",
    code: "REQ-2569-0010",
    title: "โครงการค่ายเสริมสร้างจิตสาธารณะและทักษะความเป็นผู้นำนักศึกษาเพื่อการพัฒนาชุมชนยั่งยืน",
    category: "student_activity",
    department: "งานพัฒนานักศึกษาและกิจกรรมสัมพันธ์",
    faculty: "กองพัฒนานักศึกษา",
    requesterName: "นางสาวพิมพา สุวรรณเวช",
    requesterRole: "นักวิชาการศึกษาปฏิบัติการ",
    requesterEmail: "pimpa.s@univ.ac.th",
    requesterPhone: "084-555-1234",
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-23T10:45:00Z",
    status: "returned",
    startDate: "2026-09-25",
    endDate: "2026-09-28",
    location: "ศูนย์เรียนรู้เศรษฐกิจพอเพียง ต.หนองกุง จ.ขอนแก่น",
    targetAudienceCount: 80,
    objectives: [
      "เพื่อปลูกฝังจิตสำนึกสาธารณะและส่งเสริมทักษะความเป็นผู้นำให้แก่นักศึกษา",
      "เพื่อสร้างความสัมพันธ์อันดีระหว่างมหาวิทยาลัยกับชุมชนรอบข้าง"
    ],
    rationale: "กิจกรรมเสริมหลักสูตรด้านจิตสาธารณะช่วยให้นักศึกษาได้ฝึกทักษะการแก้ปัญหาในสภาพแวดล้อมจริงและเรียนรู้วิถีชุมชน",
    expectedOutcomes: [
      "นักศึกษามีทักษะการทำงานเป็นทีมและจิตสาธารณะเพิ่มขึ้น",
      "ชุมชนได้รับประโยชน์จากการพัฒนาพื้นที่เรียนรู้"
    ],
    strategicPlan: "ยุทธศาสตร์ที่ 3: การบริการวิชาการเพื่อสร้างคุณค่าและพัฒนาสังคมอย่างยั่งยืน",
    kpiAlignment: "KPI 3.3: ร้อยละของนักศึกษาที่เข้าร่วมกิจกรรมบำเพ็ญประโยชน์เพื่อสังคม",
    expenses: [
      {
        id: "exp-301",
        category: "travel",
        description: "ค่าเหมารถบัสปรับอากาศไป-กลับ (2 คัน x 4 วัน)",
        unitPrice: 8000,
        quantity: 8,
        unit: "คัน/วัน",
        total: 64000
      },
      {
        id: "exp-302",
        category: "food",
        description: "ค่าอาหารและเครื่องดื่มสำหรับนักศึกษาและเจ้าหน้าที่ (80 คน x 10 มื้อ)",
        unitPrice: 80,
        quantity: 800,
        unit: "มื้อ",
        total: 64000,
        capLimit: 70,
        capWarning: "อัตราค่าอาหารเกินเพดาน 70 บ./คน/มื้อ สำหรับค่ายนักศึกษา"
      },
      {
        id: "exp-303",
        category: "material",
        description: "ค่าวัสดุและอุปกรณ์ปรับปรุงภูมิทัศน์ชุมชน",
        unitPrice: 20000,
        quantity: 1,
        unit: "ชุด",
        total: 20000
      }
    ],
    speakers: [],
    attachments: [
      {
        id: "att-301",
        fileName: "ร่างโครงการค่ายผู้นำจิตอาสา_2569.pdf",
        fileSize: "1.8 MB",
        fileType: "application/pdf",
        uploadedAt: "2026-08-15T09:10:00Z",
        category: "tor"
      }
    ],
    totalBudget: 148000,
    returnReason: "กรุณาปรับปรุงรายการค่าอาหารให้ไม่เกินเพดาน 70 บาท/คน/มื้อ ตามระเบียบเงินรายได้ และโปรดแนบหนังสือขออนุญาตใช้สถานที่จากผู้นำชุมชนประกอบการพิจารณาอีกครั้ง",
    timeline: [
      {
        id: "tl-301",
        stepName: "ยื่นเสนอคำขอโครงการ",
        actorName: "นางสาวพิมพา สุวรรณเวช",
        actorRole: "ผู้รับผิดชอบโครงการ",
        status: "completed",
        timestamp: "2026-08-15 09:00:00"
      },
      {
        id: "tl-302",
        stepName: "การตรวจสอบของหัวหน้าหน่วยงาน",
        actorName: "นายประเสริฐ นิติการ",
        actorRole: "ผู้อำนวยการกองพัฒนานักศึกษา",
        status: "completed",
        timestamp: "2026-08-18 13:00:00"
      },
      {
        id: "tl-303",
        stepName: "การพิจารณาด้านงบประมาณและการเงิน",
        actorName: "นางสาวศิริพร บุญเจริญ",
        actorRole: "หัวหน้างานวิเคราะห์งบประมาณ",
        status: "returned",
        timestamp: "2026-08-23 10:45:00",
        comment: "ส่งกลับให้แก้ไขรายการงบประมาณค่าอาหาร และเอกสารแนบ"
      }
    ],
    allowedActions: ["edit", "cancel"]
  },
  {
    id: "req-004",
    code: "REQ-2569-0015",
    title: "โครงการปรับปรุงระบบเครือข่ายและระบบความมั่นคงปลอดภัยสารสนเทศ (Cybersecurity Hardening)",
    category: "procurement",
    department: "ฝ่ายโครงสร้างพื้นฐานดิจิทัล",
    faculty: "สำนักบริการคอมพิวเตอร์",
    requesterName: "นายธนวัฒน์ ศรีประเสริฐ",
    requesterRole: "วิศวกรเครือข่าย",
    requesterEmail: "thanawat.s@univ.ac.th",
    requesterPhone: "081-999-8877",
    createdAt: "2026-08-24T11:00:00Z",
    updatedAt: "2026-08-24T11:00:00Z",
    status: "draft",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    location: "ห้องเซิร์ฟเวอร์หลัก อาคารศูนย์คอมพิวเตอร์",
    targetAudienceCount: 1,
    objectives: [
      "เพื่อยกระดับความปลอดภัยระบบสารสนเทศตามมาตรฐาน ISO/IEC 27001",
      "เพื่อป้องกันภัยคุกคามทางไซเบอร์และการรั่วไหลของข้อมูลส่วนบุคคล (PDPA)"
    ],
    rationale: "ความเสี่ยงด้านความปลอดภัยทางไซเบอร์เพิ่มสูงขึ้น จำเป็นต้องมีระบบ Firewall และ EDR ที่ทันสมัย",
    expectedOutcomes: [
      "ระบบสามารถตรวจจับและป้องกันการโจมตีทางไซเบอร์ได้ตลอด 24 ชั่วโมง"
    ],
    strategicPlan: "ยุทธศาสตร์ที่ 4: การบริหารจัดการองค์กรด้วยธรรมาภิบาลและดิจิทัล",
    kpiAlignment: "KPI 4.2: ดัชนีความพร้อมและเสถียรภาพของโครงสร้างพื้นฐานดิจิทัล",
    expenses: [
      {
        id: "exp-401",
        category: "material",
        description: "สิทธิ์การใช้งาน License Next-Gen Firewall (1 ปี)",
        unitPrice: 180000,
        quantity: 1,
        unit: "ระบบ",
        total: 180000
      }
    ],
    speakers: [],
    attachments: [],
    totalBudget: 180000,
    timeline: [
      {
        id: "tl-401",
        stepName: "บันทึกฉบับร่าง",
        actorName: "นายธนวัฒน์ ศรีประเสริฐ",
        actorRole: "ผู้จัดทำคำขอ",
        status: "current",
        timestamp: "2026-08-24 11:00:00"
      }
    ],
    allowedActions: ["edit", "submit", "cancel"]
  },
  {
    id: "req-005",
    code: "REQ-2569-0005",
    title: "โครงการยกระดับผลิตภัณฑ์สมุนไพรท้องถิ่นสู่มาตรฐานสากลด้วยงานวิจัยและนวัตกรรมชุมชน",
    category: "service",
    department: "ศูนย์นวัตกรรมสมุนไพรและแพทย์แผนไทย",
    faculty: "คณะเภสัชศาสตร์",
    requesterName: "ผศ.ดร. รุจิรา บุญชู",
    requesterRole: "อาจารย์ประจำสาขาเภสัชเคมี",
    requesterEmail: "rujira.b@univ.ac.th",
    requesterPhone: "086-333-4455",
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-08-19T17:00:00Z",
    status: "disbursed",
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    location: "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดงบัง",
    targetAudienceCount: 50,
    objectives: [
      "เพื่อถ่ายทอดเทคโนโลยีการสกัดสารสำคัญจากสมุนไพรให้แก่กลุ่มวิสาหกิจชุมชน",
      "เพื่อพัฒนาผลิตภัณฑ์ต้นแบบที่ได้รับมาตรฐาน อย."
    ],
    rationale: "สร้างมูลค่าเพิ่มให้แก่พืชสมุนไพรท้องถิ่นและยกระดับรายได้ของเกษตรกรในพื้นที่อย่างยั่งยืน",
    expectedOutcomes: [
      "เกิดผลิตภัณฑ์สมุนไพรแปรรูปต้นแบบ 3 รายการ",
      "วิสาหกิจชุมชนมีรายได้เพิ่มขึ้นเฉลี่ยร้อยละ 20"
    ],
    strategicPlan: "ยุทธศาสตร์ที่ 3: การบริการวิชาการเพื่อสร้างคุณค่าและพัฒนาสังคมอย่างยั่งยืน",
    kpiAlignment: "KPI 3.1: จำนวนนวัตกรรมและเทคโนโลยีที่ถ่ายทอดสู่ชุมชน",
    expenses: [
      {
        id: "exp-501",
        category: "material",
        description: "สารเคมีและบรรจุภัณฑ์สำหรับการผลิตต้นแบบ",
        unitPrice: 35000,
        quantity: 1,
        unit: "ชุด",
        total: 35000
      },
      {
        id: "exp-502",
        category: "honorarium",
        description: "ค่าตอบแทนวิทยากรผู้เชี่ยวชาญด้านมาตรฐาน GMP",
        unitPrice: 1500,
        quantity: 10,
        unit: "ชั่วโมง",
        total: 15000
      }
    ],
    speakers: [],
    attachments: [
      {
        id: "att-501",
        fileName: "รายงานสรุปผลการดำเนินโครงการ_สมุนไพร.pdf",
        fileSize: "4.2 MB",
        fileType: "application/pdf",
        uploadedAt: "2026-08-19T10:00:00Z",
        category: "other"
      }
    ],
    totalBudget: 50000,
    timeline: [
      {
        id: "tl-501",
        stepName: "ยื่นคำขอโครงการ",
        actorName: "ผศ.ดร. รุจิรา บุญชู",
        actorRole: "ผู้รับผิดชอบโครงการ",
        status: "completed",
        timestamp: "2026-07-15 08:00:00"
      },
      {
        id: "tl-502",
        stepName: "อนุมัติโครงการ",
        actorName: "ศ.ดร. วิจิตร ประภัสสร",
        actorRole: "อธิการบดี",
        status: "completed",
        timestamp: "2026-07-20 14:00:00"
      },
      {
        id: "tl-503",
        stepName: "เบิกจ่ายงบประมาณเรียบร้อย",
        actorName: "งานการเงินและบัญชี",
        actorRole: "เจ้าหน้าที่การเงิน",
        status: "completed",
        timestamp: "2026-08-19 17:00:00",
        comment: "จ่ายเงินตามใบเสร็จจริงเรียบร้อยแล้ว จำนวน 49,850 บาท"
      }
    ],
    allowedActions: []
  }
];

export function getDashboardMetrics(requests: PemaRequest[]): DashboardMetrics {
  const pending = requests.filter((r) => r.status === "pending_approval");
  const approved = requests.filter((r) => r.status === "approved");
  const returned = requests.filter((r) => r.status === "returned");

  const totalRequested = requests.reduce((sum, r) => sum + r.totalBudget, 0);
  const totalApproved = approved.reduce((sum, r) => sum + r.totalBudget, 0);

  // Action required: items that need user attention (e.g. returned items or pending ones)
  const actionRequired = requests.filter(
    (r) => r.status === "returned" || r.status === "pending_approval"
  );

  return {
    totalRequests: requests.length,
    pendingApprovalCount: pending.length,
    approvedCount: approved.length,
    returnedCount: returned.length,
    totalBudgetRequested: totalRequested,
    totalBudgetApproved: totalApproved,
    actionRequiredItems: actionRequired,
  };
}
