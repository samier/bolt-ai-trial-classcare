export const months = [
  { name: 'January', value: 1 , isDisabled: false },
  { name: 'February', value: 2 , isDisabled: false },
  { name: 'March', value: 3 , isDisabled: false },
  { name: 'April', value: 4 , isDisabled: false },
  { name: 'May', value: 5 , isDisabled: false },
  { name: 'June', value: 6 , isDisabled: false },
  { name: 'July', value: 7 , isDisabled: false },
  { name: 'August', value: 8 , isDisabled: false },
  { name: 'September', value: 9 , isDisabled: false },
  { name: 'October', value: 10 , isDisabled: false },
  { name: 'November', value: 11 , isDisabled: false },
  { name: 'December', value: 12 , isDisabled: false }
];

export const studentCategoryType = [
  {name : 'All', value : ''},
  {name : 'RTE', value : 1},
  {name : 'General', value : 0},
]

export const fields = [
  {column: 'First Name', name: "First Name"},
  {column : 'Middle Name', name : "Middle Name"},
  {column : 'Last Name', name : "Last Name"},
  {column : 'Date of Birth', name : "Date of Birth"},
  {column : 'GR Number', name : "GR Number"},
  {column : 'Category', name : "Category"},
  {column : 'Father Number', name : "Father Number"},
  {column : 'Mother Number', name : "Mother Number"}
]

export const followUpType = [
  {name : 'Email', id : 1},
  {name : 'Phone', id : 2},
  {name : 'Whatsapp', id : 3},
  {name : 'SMS', id : 4},
  {name : 'In Person', id : 5},
]

export const status = [
  { name: 'Active', id: 1 },
  { name: 'InActive', id: 0 },
  { name: 'Both', id: 2 },
]

export const studentShifts = [
  {id: 0, name: 'None'},
  {id: 1, name: 'Morning'},
  {id: 2, name: 'Noon'},
]

export const paymentModes = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Cheque" },
  { id: 3, name: "POS" },
  { id: 4, name: "NEFT" },
  { id: 5, name: "UPI" },
  { id: 6, name: "Others" }
]

export const inquiryDownloadFields = [
  { name: 'Date', id: 'date' },
  { name: 'STD/Class', id: 'std_class' },
  { name: 'Section', id: 'section' },
  { name: 'Student Name', id: 'student_name' },
  // { name: 'Visibility', id: '' },
  { name: 'Created By', id: 'created_by' },
  { name: 'First Name', id: 'first_name' },
  { name: 'Middle Name', id: 'middle_name' },
  { name: 'Last Name', id: 'last_name' },
  { name: 'First Name (Secondary Language)', id: 'secondary_first_name' },
  { name: 'Middle Name (Secondary Language)', id: 'secondary_middle_name' },
  { name: 'Last Name (Secondary Language)', id: 'secondary_last_name' },
  { name: 'Birth Date', id: 'date_of_birth' },
  { name: 'Age', id: 'age' },
  { name: 'Student Number', id: 'student_mobile' },
  { name: 'Aadhar Number', id: 'adhaar_number' },
  { name: 'Student Email', id: 'student_email' },
  { name: 'Father Name', id: 'parent_name' },
  { name: 'Father Number', id: 'parent_mobile' },
  { name: 'Mother Name', id: 'mother_name' },
  { name: 'Mother Phone No.', id: 'mother_number' },
  { name: 'Parent Email', id: 'parent_email' },
  { name: 'Whatsapp No.', id: 'watsapp_number' },
  { name: 'Gender', id: 'gender' },
  { name: 'Academic Year', id: 'academic_year_id' },
  { name: 'Class', id: 'class_id' },
  { name: 'Previous Class', id: 'previous_class' },
  { name: 'Present School', id: 'present_school' },
  { name: 'Current Address', id: 'address' },
  { name: 'Permanent Address', id: 'permanent_address' },
  { name: 'Current City', id: 'current_city' },
  { name: 'Permanent City', id: 'permanent_city' },
  { name: 'Address Type', id: 'address_type' },
  { name: 'Transportation Requirement', id: 'transportation_requirment' },
  { name: 'Discussion With', id: 'discussion_with' },
  { name: 'Inquiry Description', id: 'inquiry_discription' },
  { name: 'Remark', id: 'remark' },
  { name: 'Status', id: 'status' },
  { name: 'Follow Up', id: 'follow_up' },
  { name: 'Inquiry For', id: 'inquiry_for' },
  { name: 'Hostel Requirement', id: 'hostel_requirement' },
  { name: 'Rejeted By', id: 'rejected_by' },
]

export const lessonPlanStatus = [
  { id: "1", name: 'Not Started' },
  { id: "2", name: 'In-progress' },
  { id: "3", name: 'Completed' },
]

export const lectureStatus = [
  {id: "0", name: 'Not Started'}, 
  {id: "1", name: 'Completed'}
]

export const student_status = [
  { id: null, name: 'Both' },
  { id: 1, name: 'Active' },
  { id: 0, name: 'Inactive' }
]

export const sentSMSStatus = [
  { id: 'all', name: 'Both'}, 
  { id: '1', name: 'Success'}, 
  { id: '0', name: 'Error'}
];

export const priorities = [
  { id: 'high', name: 'High'}, 
  { id: 'medium', name: 'Medium'}, 
  { id: 'low', name: 'Low'}
];

export const requisitionsFor = [
  { id: '', name: 'All'}, 
  { id: '2', name: 'student'}, 
  { id: '1', name: 'Employee'}, 
]

export const requisitionStatus = [
  { id: '0', name: 'Pending'}, 
  { id: '1', name: 'Approved'}, 
  { id: '2', name: 'Rejected'}, 
]

export const discountType = [
  { id: 'amount', name: '₹'}, 
  { id: 'percentage', name: '%'}, 
]

export const incrementDecrement = [
  { id: 'increment', name: '+'}, 
  { id: 'decrement', name: '-'}, 
]

export const remarkType = [
  { id: 0, name: 'Negative' },
  { id: 1, name: 'Positive' },
  { id: 2, name: 'Custom' },
]


export const reminderStartType = [
  { id: '0', name: 'None' },
  { id: '1', name: 'Daily' },
  { id: '2', name: 'Weekly' },
  { id: '3', name: 'Monthly' },
]

export const reminderEndType = [
  { id: '0', name: 'Never' },
  { id: '1', name: 'Ending On' }
]

export const weeklyReminderDay = [
  { id: 'sunday', name: 'Sunday' },
  { id: 'monday', name: 'Monday' },
  { id: 'tuesday', name: 'Tuesday' },
  { id: 'wednesday', name: 'Wednesday' },
  { id: 'thursday', name: 'Thursday' },
  { id: 'friday', name: 'Friday' },
  { id: 'saturday', name: 'Saturday' },
]

export const studentStatusFeeReminder = [
  { id: '1', name: 'Active' },
  { id: '0', name: 'Inactive' },
]

export const incomeSource = [
  { id: 'student', name: 'Student'}, 
  { id: 'employee', name: 'Employee'}, 
];

export const amountType = [
  { id: '=', name: '='}, 
  { id: '>=', name: '>='}, 
  { id: '<=', name: '<='}, 
];

export const incomeExpenseStatus = [
  { id: '', name: 'All'}, 
  { id: 'draft', name: 'Draft'}, 
  { id: 'copied', name: 'Copied'}, 
];

export const accountType = [
  { id: 'saving', name: 'Saving'}, 
  { id: 'current', name: 'Current'}, 
];

export const ledgerType = [
  { id: 'income', name: 'Income'}, 
  { id: 'expense', name: 'Expense'}, 
];

export const eventGalleryFor = [
  { id: '1', name: 'All'},
  { id: '2', name: 'Batch'},
  { id: '3', name: 'Employee'},
];

export const sortByF = [
  { id:'' , name: 'Roll Number'},
  { id:'high_present',name: 'High Present'},
  { id:'low_present', name: 'Low Present'}, 
  { id:'high_absent',name: 'High Absent'},
  { id:'low_absent', name: 'Low Absent'},
  { id:'high_leave' , name: 'High Leave'},
  { id:'low_leave' , name: 'Low Leave'}
];

export const studentStatusForRank = [
  { id: 1, name: 'Active' },
  { id: 0, name: 'Inactive' },
  { id: 2, name: 'Both' },
]

export const sessionList = [
  { id: 1, name: 'Session 1' },
  { id: 3, name: 'Exam Attendance' },
  { id: 2, name: 'Session 2' }
];

export const userType = [
  { id: 0, name: 'Is Admin' },
  { id: 1, name: 'Is Faculty' },
  { id: 2, name: 'Is Administrator' },
  { id: 3, name: 'Both' },
  { id: 4, name: 'Is Driver' },
  { id: 5, name: 'Is Warden' }
]

export const sentNotificationList = [
  { id: '1', name: 'Read' },
  { id: '0', name: 'Unread' },
  { id: '', name: 'Both' },
]

export const apiVersions = {
  v1: '/v1/',
  v2: '/v2/'
}

export const fileIcons:any = {
  "pdf" : './assets/img/files/file.png',
  "png" : './assets/img/files/image.png',
  "jpg" : './assets/img/files/image.png',
  "jpeg" : './assets/img/files/image.png',
  "gif" : './assets/img/files/image.png',
  "webp" : './assets/img/files/image.png',
};

export const chequeStatusList = [
  { id: 'received', name: 'Received' },
  { id: 'bounced', name: 'Bounced' },
  { id: 'clear', name: 'Cleared' },
  { id: 'cancelled', name: 'Cancelled' },
]

export const session = [
  {id: '1', name: 'Session 1'},
  {id: '2', name: 'Session 2'}
]
