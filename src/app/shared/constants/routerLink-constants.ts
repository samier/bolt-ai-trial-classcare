export const URLConstants = {
    // All routes should be defined here

    // Example:
    // LOGIN: '/public/login',
    // leave modules
    LEAVES_CREATE: 'leaves/leave-create', //
    LEAVES_LIST: '/leaves/leave-list',
    ADMIN_LEAVE_EDIT_FORM: '/leaves/admin-leave-edit-form',
    FACULTY_EDIT_STUDENT_LEAVE: '/leaves/faculty-edit-student-leave',
    FACULTY_LEAVE_EDIT_FORM: '/leaves/faculty-leave-edit-form',

    STUDENT_LEAVE_EDIT_FORM: '/student/leaves/student-leave-edit-form',
    STUDENT_LEAVE: '/student/leaves/student-leave', //
    STUDENT_LEAVE_LIST: '/student/leaves/student-leave-list',
    STUDENT_LEAVE_CREATE: '/student/leaves/student-leave',

    FACULTY_LEAVE: 'leaves/faculty-leave', //
    FACULTY_LEAVE_LIST: '/leaves/faculty-leave-list',
    FACULTY_LEAVE_CREATE: '/leaves/faculty-leave',
    FACULTY_STUDENT_LEAVEL_LIST: '/leaves/faculty-student-leave-list',
    FACULTY_ADD_STUDENT_LEAVE: '/leaves/faculty-add-student-leave',
    ADMIN_STUDENT_TAB: 'student/leaves/admin-student-leave-list-tab',

    //leaves/admin-student-leave-list-tab/238

    //lesson module
    CREATE_LESSON:'/lesson/create-lesson',
    ADMIN_CREATE_LESSON:'/lesson/add-admin-new-record',
    LESSON_LIST:'/lesson/lesson-list',
    FACULTY_LESSON_LIST:'/lesson/faculty-lesson-list',
    LESSON_EDIT_FORM: '/lesson/edit-lesson',
    ADMIN_EDIT_FORM: '/lesson/admin-edit-record',
    // meal module
    MEALS_LIST: '/meal/meal-list',
    MEALS_CREATE: '/meal/meal-create',
    MEALS_EDIT: '/meal/meal-edit',

    // date wise meal
    DATE_WISE_MEALS_LIST: '/meal/date-wise-meal-list',
    DATE_WISE_MEALS_CREATE: '/meal/date-wise-meal-create',
    DATE_WISE_MEALS_EDIT: '/meal/date-wise-meal-edit',

    // transport module
    // document types
    DOCUMENT_TYPE_LIST: '/transport/document-type-list',
    DOCUMENT_TYPE_CREATE: '/transport/document-type-create',
    DOCUMENT_TYPE_EDIT: '/transport/document-type-edit',

    //vehicle
    VEHICLE_LIST: '/transport/vehicle-list',
    VEHICLE_CREATE: '/transport/vehicle-create',
    VEHICLE_EDIT: '/transport/vehicle-edit',
    VEHICLE_DOCUMENT_LIST: '/transport/document-list',

    //driver
    DRIVER_LIST: '/user/user-list/driver',
    DRIVER_CREATE: '/transport/driver-create',
    DRIVER_EDIT: '/transport/driver-edit',

    //routes
    ROUTE_LIST: '/transport/route-list',
    ROUTE_CREATE: '/transport/route-create',
    ROUTE_EDIT: '/transport/route-edit',

    // stops
    STOPS_LIST: '/transport/stops-list',
    STOPS_CREATE: '/transport/stops-create',
    STOPS_EDIT: '/transport/stops-edit',
    STOPS_LOGS: '/transport/stops-list/stop-logs',
    STOPS_LOGS_DETAIL: '/transport/stops-list/stop-logs-detail',

    // assign-transport
    ASSIGN_TRANSPORT_LIST: '/transport/assign-transport-list',
    ASSIGN_TRANSPORT: '/transport/assign-transport',
    ASSIGN_TRANSPORT_CREATE: '/transport/assign-transport-create',
    ASSIGN_TRANSPORT_EDIT: '/transport/assign-transport-edit',

    TRANSPORT_AREA: 'transport/transport-area',

    // transport setting
    TRANSPORT_SETTING : '/transport/transport-setting',

    //teacher diary
    ADD_RECORD:'/teacher-diary/add-record',
    ADMIN_ADD_RECORD:'/teacher-diary/admin-add-record',
    TEACHER_DIARY_LIST: '/teacher-diary/teacher-diary-list',
    ADMIN_DIARY_LIST: '/teacher-diary/admin-diary-list',
    TEACHER_DIARY_EDIT_FORM: '/teacher-diary/teacher-diary-edit-form',

    ADMIN_TEACHER_DIARY_EDIT_FORM: '/teacher-diary/admin-edit-record',

    //faculty-transport
    TRANSPORT : '/transport/faculty-transport',
    TEST : '/student/test/leave-test',

    //CHAPTER
    CHAPTER_LIST: '/mcq/chapter-list',
    CHAPTER_CREATE: '/mcq/chapter-create',
    CHAPTER_EDIT: '/mcq/chapter-edit',

    //QUESTION
    QUESTION_LIST: '/mcq/question-list',
    QUESTION_CREATE: '/mcq/question-create',
    QUESTION_EDIT: '/mcq/question-edit',
    QUESTION_VIEW: '/mcq/question-view',

    //RESULT
    RESULT_LIST : '/mcq/result-list',

    //EXAM
    EXAM_LIST: '/mcq/exam-list',
    EXAM_CREATE: '/mcq/exam-create',
    EXAM_EDIT: '/mcq/exam-edit',

    // STUDENT EXAM
    STUDENT_EXAM_LIST : '/student/exam/exam-list',
    STUDENT_EXAM_DETAIL : '/student/exam/exam-detail/',
    STUDENT_EXAM_FORM : '/student/exam/exam/',

    //ADMIN_STUDENT_EXAM
    ADMIN_STUDENT_EXAM : 'student/mcq/student-exam',

    //HRA
    //####HRA###
    //Role
    ROLE_LIST:'/hra/role-list',
    ADD_ROLE:'/hra/add-role',
    EDIT_ROLE:'/hra/edit-role',

    //Role wise user access
    ROLE_ACCESS_LIST:'/hra/role-wise-user-permission-list',

    //LEAVE TYPES
    LEAVE_TYPE_LIST:'/hra/leave-type-list',
    ADD_LEAVE_TYPE:'/hra/add-leave-type',
    EDIT_LEAVE_TYPE:'/hra/edit-leave-type',

    //ASSIGN LEAVES ROLES
    ASSIGN_LEAVE_ROLE:'/hra/assign-leave-role',

    //MENU LEAVE
    MENU_LIST:'/hra/menu-list',

    //User
    ADD_USER:'/user/add-user',
    EDIT_USER:'/user/edit-user',
    USER_PROFILE: '/user/profile',
    USER_LIST:'/user/user-list',
    ADMIN_USER_LIST:'/user/admin-user-list',
    SET_LEAVE_APPROVER:'/hra/set-leave-approver',
    EXPORT_FACULTY:'/user/export-faculty',
    FACULTY_ATTENDANCE_REPORT: '/user/attendance-report',
    STAFF_ATTENDANCE : '/user/staff-attendance',
    STAFF_ATTENDANCE_MACHINE_REPORT : '/user/attendance-machine-report',
    STAFF_IN_OUT_LOGS : '/user/attendance-machine-report/in-out-logs',
    IMPORT_USERS: 'import/import-users',

    //Assign Subject
    ASSIGN_SUBJECT_USER:'/user/assign-subjects',
    ASSIGN_SUBJECT_STUDENT:'/user/manage-student-subjects',

    //Student Leaaving Certificate
    LEAVING_CERTIFICATE_LIST:'/student-leaving-certificate/list',
    LEAVING_CERTIFICATE_ADD:'/student-leaving-certificate/add',
    LEAVING_CERTIFICATE_VIEW:'/student-leaving-certificate/view',
    LEAVING_CERTIFICATE_EDIT:'/student-leaving-certificate/edit',
    LEAVING_CERTIFICATE_VIEW_DETAIL:'/student-leaving-certificate/view-details',

    // Quick Student Attendance 
    QUICK_ATTENDANCE : '/attendance/quick-student-attendance',

    //Exam Type Section
    EXAM_TYPE_LIST:'/exam-type/list',
    ADD_EXAM_TYPE:'/exam-type/add',
    EDIT_EXAM_TYPE:'/exam-type/edit',

    //Whatsapp History
    // WHATSAPP_HISTORY_LIST:'/message/whatsapp-history',
    MESSAGE: '/message/list',
    REMAINING_FEE_SMS: '/message/remaining-fee-sms',

    //report
    STUDENT_REPORT: '/report/student-report',
    STUDENT_CATEGORY_REPORT: '/report/student-category-report',
    STUDENT_GENDER_REPORT: '/report/student-gender-report',
    STUDENT_ACTIVE_INACTIVE_REPORT: '/report/student-active-inactive-report',
    FEES_REPORT:'/report/fees-report',
    TRANSPORT_REPORT:'/report/transport-report',
    FEES_REPORT_DATEWISE:'/report/fees-receipt-details-datewise',
    FEES_DUE_REPORT: 'report/fees-due-report',
    MASTER_FEES_REPORT: 'report/master-fees-report',
    Blank_Attendance : 'attendance/present-attendance-blank-sheet' ,
    EXPENSE_REPORT:'report/expense-report',
    BATCH_REPORT: 'report/batch-report',
    EXAM_GENERAL_REPORT: 'report/exam-general-report',
    STUDENT_MONTHLY_REPORT: 'report/student-monthly-report',
    FEES_DISCOUNT_REPORT:'report/fees-discount-report',
    STUDENT_MONTHLY_REPORT_PROFILE: 'student/monthly-report/',   
    STUDENT_STRENGTH_REPORT:'report/strength-summary-report',
    STUDENT_ATTENDANCE_MONTHLY_YEARLY : 'report/student-attendance-monthly-yearly-report',
    STUDENT_BLANK_REPORT: 'report/student-blank-report',

    //send transport whatsapp message
    SEND_TRANSPORT_WHATSAPP_MESSAGE:'/message/send-transport-message',


    // application login report
    APPLICATION_LOGIN_REPORT:'/report/application-log-in-report',
    //exam-timetable

    GENERATE_EXAM_TIMETABLE:'exam-timetable/exam-timetable-form',
    //Timetable
    ADD_LECTURE_TIMINGS:'/timetable/add-lecture-timings',
    ADD_TIME_SLOT:'/timetable/add-time-slot',
    ASSIGN_ROOM:'/timetable/assign-room',
    CREATE_ROOM:'/timetable/create-room',
    ASSIGN_LECTURE:'/timetable/subject-lecture-list',
    SUBJECT_LECTURE:'/timetable/subject-lecture',
    ADD_TIMETABLE:'/timetable/create-timetable',
    TEACHERS_TIMETABLE:'/timetable/teachers-timetable',
    PROXY_TEACHERS_TIMETABLE:'/timetable/proxy-teachers-timetable',
    PROXY_TIMETABLE_LIST:'/timetable/proxy-timetable-list',
    FACULTY_TIMETABLE : 'timetable/faculty-timetable',
    ASSIGN_SUBJECT: 'timetable/add-subject',
    ADD_EXTRA_LECTURE: 'timetable/add-extra-lecture',
    EXTRA_LECTURE_LIST: 'timetable/extra-lecture-list',
    DOWNLOAD_TIMETABLE: 'timetable/download-timetable',

    //Student gr reports
    STUDENT_GR_REPORT: '/student-gr-reports/list',

    //Exam grade
    CREATE_EXAM_GRADE : '/exam/exam-grade',
    EDIT_EXAM_GRADE : '/exam/exam-grade/',
    LIST_EXAM_GRADE : '/exam/exam-grade-list',

    // fees module
    FEES_DISCOUNT:'/fees/fees-discount',
    FEES_DISCOUNT_TYPE:'/fees/fees-type/discount',
    EDIT_DISCOUNT:'/fees/edit-discount',
    STUDENT_DISCOUNT:'/fees/student-discount',

    //payroll
    PAYROLL:'hra/payroll/home',
    ADD_SALARY:'hra/payroll/add-salary',
    ADD_PAYROLL_CATEGORY:'hra/payroll/add-payroll-category',
    PAYROLL_CATEGORY_LIST:'hra/payroll/payroll-category-list',
    PAYROLL_GROUP:'hra/payroll/payroll-group-list',
    ASSIGN_PAYROLL_GROUP:'hra/payroll/assign-payroll-group',
    PAYSLIP_LIST:'hra/payroll/payslip-list',
    ASSIGNED_PAYROLL_GROUP_LIST:'hra/payroll/assigned-payroll-group-list',
    ADD_PAYROLL_GROUP:'hra/payroll/add-payroll-group',
    GENERATE_PAYSLIP:'hra/payroll/generate-payslip',
    STAFF_PAYSLIP:'hra/payroll/staff-payslip-list',
    ATTENDANCE_LIST:'hra/payroll/attendace-list',
    MONTHWISE_LIST:'hra/payroll/monthwise-list',
    PAYROLL_CALCULATION:'hra/payroll/payroll-calculation',
    MONTHLY_WORKING_DAYS:'hra/payroll/set-monthly-working-days',


    FEES_REFUND:'/fees/fees-refund',
    REFUND_TYPE:'/fees/refund-type',
    REFUND_TYPE_TYPE:'/fees/fees-type/refund',
    FEES_TABS:'/fees/fees-tabs-layout',
    REFUND_EDIT:'/fees/edit-refund',
    STUDENT_DISCOUNT_TYPE:'/fees/fees-type/student-discount',
    FEE_REFUND_TYPE:'/fees/fees-type/refund-type',

    // fees receipt no
    FEES_RECEIPT_NO: '/fees/fees-receipt-no',
    CREATE_FEES_RECEIPT_NO: '/fees/create-fees-receipt-no',
    EDIT_FEES_RECEIPT_NO: '/fees/edit-fees-receipt-no',

    EXAM_SETTING: 'template/create-exam-report',

    //trust details
    TRUST_LIST : 'trust/list',
    TRUST_CREATE : 'trust/create',
    TRUST_EDIT : 'trust/edit',

    //fees category
    FEES_CATEGORY_LIST : 'fees-category/list',
    FEES_CATEGORY_CREATE : 'fees-category/create',
    FEES_CATEGORY_EDIT : 'fees-category/edit',
    COLLECT_FEES:'fees/collect-fees',
    FEES_RECEIPT_LIST:'fees/fees-receipts',
    IMPORT_FEES:'import/fees',
    GENERATE_DISCOUNT_RECEIPT: 'fees/bulk-discount',
    GENERATE_DISCOUNT_RECEIPT_LOG: 'fees/bulk-discount/log',
    GENERATE_DISCOUNT_RECEIPT_LOG_DETAILS: 'fees/bulk-discount/log/',
    STUDENT_BULK_DISCOUNT: 'fees/student-bulk-discount',
    STUDENT_BULK_DISCOUNT_ADD: 'fees/student-bulk-discount/add',


    //Poll management
    POLL_LIST: '/poll/list',
    POLL_CREATE: '/poll/create',
    POLL_EDIT: '/poll/edit',
    STUDENT_POLL_LIST: '/student/poll-student/list',

    // Inventory module
    VENDOR_LIST:'/inventory-management/vendor-list',
    VENDOR_FORM:'/inventory-management/vendor-form',
    VENDOR_ITEM:'/inventory-management/vendor-item',
    ADD_VENDOR_ITEM:'/inventory-management/add-item-vendor',
    INVENTORY_LIST:'/inventory-management/item-list',
    INVENTORY_ADD_FORM:'/inventory-management/item-form',
    PURCHASE_ADD_FORM:'/inventory-management/add-purchase',
    PURCHASE_LIST:'/inventory-management/purchase-list',
    ADD_INVENTORY_TYPE:'/inventory-management/item-type',
    ADD_STORE_TYPE:'/inventory-management/warehouse',
    REQUISITION_LIST:'inventory-management/requisition-list',
    REQUISITION_FORM:'inventory-management/requisition-form',
    INVENTORY_SETTINGS:'inventory-management/inventory-settings',
    PURCHASE_ORDER_LIST:'inventory-management/purchase-order-list',
    PURCHASE_ORDER_FORM:'inventory-management/purchase-order-form',
    INVOICE_ORDER_LIST:'inventory-management/purchase-order-invoice-list',
    INVOICE_ORDER_FORM:'inventory-management/purchase-order-invoice',
    PURCHASE_RETURN_LIST:'inventory-management/purchase-return-list',
    PURCHASE_RETURN_FORM:'inventory-management/purchase-return',
    INTERNAL_ISSUE_LIST:'inventory-management/item-issue-list',
    INTERNAL_ISSUE_FORM:'inventory-management/item-issue',
    INTERNAL_ISSUE_RETURN_LIST:'inventory-management/item-issue-return-list',
    INTERNAL_ISSUE_RETURN_FORM:'inventory-management/item-issue-return-form',
    DISCARD_ITEM_LIST:'inventory-management/discard-item-list',
    DISCARD_ITEM_FORM:'inventory-management/discard-item-form',
    ADJUST_STOCK_ITEM_LIST:'inventory-management/stock-adjustment-list',
    ADJUST_STOCK_ITEM_FORM:'inventory-management/stock-adjustment-form',
    KIT_LIST:'inventory-management/kit-list',
    KIT_FORM:'inventory-management/kit-form',
    ITEM_SUMMARY:'inventory-management/item-summary',
    FACULTY_REQUISITION:'inventory-management/faculty-requistion-form',
    FACULTY_REQUISITION_LIST:'inventory-management/faculty-requistion-list',

    STUDENT_REQUISITION_LIST: '/student/inventory-management/student-requisition-list',
    STUDENT_REQUISITION_FORM: '/student/inventory-management/student-requisition-form',

    //chat module
    CHAT:'/chat',
    STUDENT_CHAT:'/student/chat-student',
    //school crud
    SCHOOL_LIST: 'school/list',

    //Exam report card
    EXAM_REPORT_CARD_GENERATE : 'exam-report-card/generate',
    EXAM_REPORT_CARD_GENERATE_STUDENT : 'exam-report-card-student/generate-result',
    EXAM_REPORT_CARD_GENERATE_FACULTY : 'exam-report-card/faculty/result-generate',
    Edit_EXAM_REPORT_CARD_GENERATE: 'exam-report-card/edit',
    //Attendance Management
    STUDENT_DAILY_ATTENDANCE_REPORT_GENERATE: '/attendance/student-daily-report/generate',
    STUDENT_TAKE_ATTENDANCE : 'student/take-attendance',
    VIEW_ATTENDANCE_LIST : 'attendance/view-attendance-list',
    BATCHWISE_ATTENDANCE_LIST : 'attendance/batch-wise-attendance-list',

    MARKS_BULK_EDIT: 'exam/marks-bulk-edit',
    //student management
    STUDENT_BULK_EDIT: 'students/bulk-edit',
    EXAM_VIEW_LIST : 'exam/list',
    CREATE_EXAM : 'exam/create',

    STUDENT_LIST:'student/student-list',
    STUDENT_ADD:'student/add',
    STUDENT_EDIT:'student/edit',
    STUDENT_PROFILE:'student/student-profile',
    BANK_DETAILS:'student/bank-detail',
    STUDENT_DOCUMENT:'student/documents',

    TEMPLATE_MANAGER: '/template/list',

    PERFORMANCE_CATEGORY : 'performance/categories',
    PERFORMANCE_CRITERIA : 'performance/criteria',
    STUDENT_PERFORMANCE : 'performance/student-performance',

    //School Name
    CREATE_SCHOOL : 'school-name/create',
    LIST_SCHOOL : 'school-name/list',
    EDIT_SCHOOL : 'school-name/edit',


    //hostel management
    WARDEN_LIST : 'user/user-list/warden',
    WARDEN_CREATE : 'hostel/create-warden',
    WARDEN_EDIT : 'hostel/edit-warden',

    HOSTEL_LIST : 'hostel/list',
    HOSTEL_CREATE : 'hostel/create',
    HOSTEL_EDIT : 'hostel/edit',

    ROOM_LIST : 'hostel/list-room',
    ROOM_CREATE : 'hostel/create-room',
    ROOM_EDIT : 'hostel/edit-room',

    ROOM_TYPE_LIST : 'hostel/room-types',
    WING_LIST: 'hostel/wings',

    ASSIGN_STUDENT_ROOM: 'hostel/assign-student',
    HOSTEL_STUDENT_TRANSFER: 'hostel/student-transfer',

    HOSTEL_REPORT: 'hostel/room-report',
    //event type
    CREATE_EVENT : 'event-type/create',
    LIST_EVENT : 'event-type/list',
    EDIT_EVENT : 'event-type/edit',

    //event
    EVENT_CREATE : 'event/create',
    EVENT_LIST : 'event/list',
    EVENT_EDIT : 'event/edit',

    // assign optional fees
    ASSIGN_OPTIONAL_FEES: 'fees/assign-optional-fees',
    ASSIGN_OPTIONAL_FEES_LOG: 'fees/assign-optional-fees/log',
    // student wallet
    WALLETS: 'fees/wallets',
    WALLET_HISTORY: 'fees/wallet-history',
    STUDENT_WALLET_HISTORY : 'student/fees/student-wallet-history',
    WALLET_DAILY_REPORT : 'fees/wallet-daily-report',
    //remark
    REMARK_LIST: 'student/remark/admin-student-remark-list-tab',
    STUDENT_REMARK_LIST: '/student/remarks/list',

    //certificate generator
    GENERATE_CERTIFICATE: 'certificate/list',
    // document
    DOCUMENT_MANAGER :'document-manager/document-list',
    DOCUMENT_ADD : 'document-manager/document-add',
    DOCUMENT_EDIT : 'document-manager/document-edit',

    CAREER_LIST : 'document-manager/document-edit',
    ALUMNI_EVENT_LIST : 'document-manager/document-edit',
    // academic year
    ACADEMICS:'student/academics/academic-details',
    //import student
    STUDENT_IMPORT : 'import/import-form',

    //fees import
    FEES_IMPORT_LIST : 'import/fees/list',
    FEES_IMPORT_DETAIL : 'import/fees/detail',
    STUDENT_COLLECT_FEES:'student/collect-fees',
    // fees-collection-center
    FEES_CENTER:'fees-collection/centers',
    ADD_CENTER:'fees-collection/add-center',
    EDIT_CENTER:'fees-collection/edit-center',
    FEES_COLLECTION_DETAIL:'fees-collection/detail',

    FEES_REFUND_LIST:'/fees/fees-refund-list',
    FEES_REFUND_CREATE:'/fees/add-fees-refund',
    FEES_REFUND_EDIT:'/fees/edit-fees-refund',

    STUDENT_FEES_REFUND: 'student/refund-fees',

    //course wise fees update report
    COURSE_FEES_UPDATE:'report/student-academic-fees-report',
    BIRTHDAY_LIST:'report/birthday-list',

    BATCH_LIST:'batch/list',
    BATCH_TRANSFER:'batch/transfer',
    BATCH_ORDER: 'batch/order',

    // Assignment

    // Homework
    HOMEWORK_LIST   : 'assignment/homework-list',
    VIEW_HOMEWORK   : 'assignment/view-homework' ,
    ADD_HOMEWORK    : 'assignment/add-homework',
    EDIT_HOMEWORK   : 'assignment/edit-homework',

    // Assignment
    ASSIGNMENT_LIST : 'assignment/assignment-list',
    VIEW_ASSIGNMENT : 'assignment/view-assignment',
    ADD_ASSIGNMENT  : 'assignment/add-assignment',
    EDIT_ASSIGNMENT : 'assignment/edit-assignment',

   // Classwork
   CLASSWORK_LIST   : 'assignment/classwork-list',
   VIEW_CLASSWORK   : 'assignment/view-classwork' ,
   ADD_CLASSWORK    : 'assignment/add-classwork',
   EDIT_CLASSWORK   : 'assignment/edit-classwork',

   // Syallbus
   SYLLABUS_LIST   : 'assignment/syllabus-list',
   VIEW_SYLLABUS  : 'assignment/view-syllabus' ,
   ADD_SYLLABUS    : 'assignment/add-syllabus',
   EDIT_SYLLABUS   : 'assignment/edit-syllabus',

    // Notes
   NOTES_LIST    : 'assignment/notes-list',
   VIEW_NOTES   : 'assignment/view-notes' ,
   ADD_NOTES    : 'assignment/add-notes',
   EDIT_NOTES   : 'assignment/edit-notes',

   // Video Link
   VIDEO_LIST    : 'assignment/videolink-list',
   VIEW_VIDEO    : 'assignment/view-videolink' ,
   ADD_VIDEO     : 'assignment/add-videolink',
   EDIT_VIDEO    : 'assignment/edit-videolink',

   NOTICE_LIST    : 'assignment/notice-list',
   VIEW_NOTICE    : 'assignment/view-notice' ,
   ADD_NOTICE     : 'assignment/add-notice',
   EDIT_NOTICE    : 'assignment/edit-notice',
   NOTICE_HISTORY : 'assignment/notice-history',

    TRANSPORT_TRANSFER: 'transport/student-transport',
    TRANSPORT_TRANSFER_LIST: 'transport/transport-transfer',

    IMPORT_STUDENT :'import/import-form',

    MANAGE_STUDENT_ROLL_NO :'batch/manage-student-roll-no',

    EXAM_LISTS : 'exam/list',
    EXAM_VIEW : 'exam/view' ,
    EXAM_IMPORTED_MARKS : 'exam/imported-marks' ,
    EXAM_IMPORTED_MARKS_LOG : 'exam/imported-marks-log' ,

    DASHBOARD : 'dashboard',
    CREATE_MARKSHEET : 'result/create-marksheet',
    EDIT_MARKSHEET : 'result/edit-marksheet',
    MARKSHEET_TEMP_LIST : 'result/marksheet-template-list',
    MARKSHEET_TEMP_DESIGN : 'result/marksheet-template-design',
    MARKSHEET_LIST : 'result/marksheet-list',
    ASSIGN_EXAM : 'result/assign-exam',
    MARKSHEET_ACTION : 'result/action',
    UPLOAD_DOCUMENT : 'upload-document',
    STUDENT_WISE_RESULT : 'result/student-wise-result',

    CREATE_NEW_EXAM : 'exam/create',
    //Area
    AREA_LIST: 'transport/area/',
    AREA_CREATE: 'transport/area-create',


    CUSTOM_FIELD : 'custom-field',
    CUSTOM_FIELDS_ADD : 'custom-field/add',
    HALL_TICKET : 'hall-ticket',
    BLANK_EXAM_SHEET : 'exam/blank-sheet',

    FEES_REMINDER :'report/fees-reminder',
    STUDENT_ATTENDANCE_LIST: 'result/student-attendance-list',
    STUDENT_ATTENDANCE : 'result/student-attendance',
    TAKE_SINGLE_ATTENDENCE : 'attendance/takeSingleAttendance',
    STAFF_ATTENDENCE : 'staff_attendance',

    ADD_SIDHI_GUN : 'result/add-sidhi-gun',
    TEACHER_ACHIVEMENT : 'teacher-achivement',

    ADD_INQUIRY  : 'inquiry/add',
    INQUIRY_LIST : 'inquiry/list' ,
    INQUIRY_EDIT: 'inquiry/edit' ,
    INQUIRY_IMPORT: 'inquiry/import' ,
    INQUIRY_VIEW: 'inquiry/view' ,
    
    STUDENT_ACADEMIC : 'student/academics/academic-details' ,
    STUDENT_FEE      : 'student/collect-fees' ,
    STUDENT_EXAM     : 'student/mcq/student-exam' ,

    STAFF_TAKE_ATTENDANCE : 'user/staff-attendance',

    STUDENT_TRANSPORT : 'student/transport',
    STUDENT_HOSTEL : 'student/hostel',

    STUDENT_RANK_LIST : 'exam/student-rank-list',

    STUDENT_NEW_PROFILE : 'student/student-profile',
    // Setting-->Subject
    SUBJECT_LIST : 'subject/subject-list',
    ADD_SUBJECT : 'subject/add-subject',


    COURSE_ADD: 'course/add',
    COURSE_EDIT: 'course/edit',
    COURSE_LIST: 'course/list',
    COURSE_ORDER: 'subject/order',
    
    TEACHER_REMARK_LIST : 'result/teacher-remark-list',
    TEACHER_REMARK : 'result/teacher-remark',

    BATCH : 'batch',

    STUDENT_OPTIONAL_FEES : 'student/optional-fees' ,


    ASSIGN_BATCH:'/user/assign-batches',
    // STUDENT_NEW_PROFILE : 'student/student-profile/',


    // SYSTEM-SETTING

    OPT_LOG : 'setting/otp-log',

    //Expense
    // EXPENSE_LIST : 'expenses/expenseReport',
    ADD_EXPENSE : 'expenses/add-expense',
    STUDENT_NOTICE_HISTORY: 'student/notice-history',

    CLASS_ORDER : 'course/order', 

    FEES_DASHBOARD : 'fees/dashboard',

    // SECTION
    SECTION_LIST : 'section/list',

    INQUIRY_FIELD_SETTING: 'inquiry/field-setting',
    INQUIRY_FOLLOW_UP : 'inquiry/follow-up',
    ADD_INQUIRY_FOLLOW_UP: 'inquiry/add/follow-up/',
    EDIT_INQUIRY_FOLLOW_UP: 'inquiry/follow-up/edit',

    YEAR_LIST:'academic-year/transfer-list',
    YEAR_TRANSFER:'academic-year/transfer',

    ACADEMIC_YEAR_LIST : 'academic-year/list',
    ACADEMIC_YEAR_CREATE : 'academic-year/add',
    ACADEMIC_YEAR_EDIT : 'academic-year/edit',

    // ACTIVITY LOG
    ACTIVITY_LOG_LIST : 'activity-log/list',
    // SECTION 

    // COMPLAIN MODULE 

    COMPLAIN_LIST : 'concern/list',
    COMPLAIN_ADD  : 'complain/add',
    COMPLAIN_EDIT : 'complain/edit',
    COMPLAIN_VIEW : 'concern/view',
    
    EDIT_USER_PROFILE : 'user/profile' ,
    PLAN_DETAIL : 'user/plan-details' ,

    USER_BRANCH_LIST : 'user/branch-list' ,
    BRANCH_ADD : 'user/branch-add',
    BRANCH_EDIT : 'user/branch-edit',

    INQUIRY_FEES_REPORT : 'report/inquiry-fees',

    SYSTEM_SETTING : 'setting/system',
    NOTIFICATION_SETTING : 'setting/notification',
    FORM_BUILDER_INQUIRY_ADD :'form-builder/inquiry-add',
    FORM_BUILDER_INQUIRY_LIST :'form-builder/inquiry-list',
    FORM_BUILDER_INQUIRY_EDIT :'form-builder/inquiry-edit',
    
    STUDENT_DASHBOARD: 'student/student-dashboard',

    // User Daily Plan
    ADD_LESSON_PLAN: 'user-daily-plan/add-lesson-plan',
    EDIT_LESSON_PLAN: 'user-daily-plan/edit-lesson-plan',
    LESSON_PLAN_LIST: 'user-daily-plan/lesson-plan-list',
    ADD_LECTURE: 'user-daily-plan/add-lecture',
    EDIT_LECTURE: 'user-daily-plan/edit-lecture',
    LECTURES_LIST: 'user-daily-plan/lectures-list',
    // COMBINE MARKSHEET 
    
    COMBINE_MARKSHEET_LIST   : 'combine-marksheet/combine-marksheet-list',
    CREATE_COMBINE_MARKSHEET : 'combine-marksheet/create-marksheet',
    EDIT_COMBINE_MARKSHEET   : 'combine-marksheet/edit-marksheet',
    COMBINE_MARKSHEET_EDIT   : 'combine-marksheet/edit-marksheet',
    DOWNLOAD_COMBINE_RESULT  : 'combine-marksheet/download-combine-result',
    COMBINE_RESULT_SETUP     : 'combine-marksheet/combine-result-setup',
    GENERATE_MARKSHHET_SETUP : 'combine-marksheet/generate-marksheet-setup',

    //remark
    STUDENT_REMARKS_LIST : 'remark/list',
    STUDENT_REMARKS_CREATE : 'remark/create',
    STUDENT_REMARKS_EDIT : 'remark/edit',
    PREDEFINE_REMARKS_LIST : 'remark/predefine-remark-list',
    PREDEFINE_REMARKS_CREATE : 'remark/create-predefine-remark',
    PREDEFINE_REMARKS_EDIT : 'remark/edit-predefine-remark',

    //Auto Fee Reminder
    AUTO_FEE_REMINDER_LIST : 'fees/auto-fee-reminder/list',
    AUTO_FEE_REMINDER_SETUP : 'fees/auto-fee-reminder/setup',
    AUTO_FEE_REMINDER_EDIT : 'fees/auto-fee-reminder/edit/',
    AUTO_FEE_REMINDER_DETAILS : 'fees/auto-fee-reminder/details/',
    //section wise fees report
    SECTION_WISE_FEES_REPORT: 'report/section-wise-fees-report',
    EDIT_EXAM: 'exam/edit',
    ENTER_MARKS: 'exam/result',
    FLOOR_LIST: 'hostel/list-floor',

    // Income/expense Module
    ADD_BANK_ACCOUNT: 'income-expense/add-bank-account',
    EDIT_BANK_ACCOUNT: 'income-expense/edit-bank-account',
    BANK_ACCOUNT_LIST: 'income-expense/bank-account-list',
    INCOME: 'income-expense/income',
    INCOME_LIST: 'income-expense/income-list',
    TAX_LIST: 'income-expense/tax-list',
    LEDGER_LIST: 'income-expense/ledger-list',
    HEAD_LIST: 'income-expense/head-list',
    EXPENSE: 'income-expense/expense',
    EXPENSE_LIST: 'income-expense/expense-list',
    PROFIT_LOSS: 'income-expense/profit-loss',

    BATCH_STUDENT : 'batch/student',

    STUDENT_RANKING: 'exam/student-ranking',

    //event gallery
    EVENT_GALLERY_LIST: 'event/gallery-list',
    EVENT_GALLERY_DETAIL: 'event/gallery-detail',
    STUDETN_EVENT : 'student/event',
    EVENT_DETAIL : 'student/eventDetail',

    //calendar module
    CALENDAR : 'calendar',
    ADD_MULTI_EVENT : 'calendar/add-event-holiday',
    EVENT_HOLIDAY_LIST : 'calendar/event-holiday-list',
    EVENT_TYPE_LIST : 'calendar/event-type-list',

    COLLECT_CHEQUE: 'fees/cheque/collect-cheque',
    CHEQUE_LIST: 'fees/cheque/cheque-list',

    STUDENT_WALLET_MINUS_REPORT: 'report/student-wallet-minus-report',
}
