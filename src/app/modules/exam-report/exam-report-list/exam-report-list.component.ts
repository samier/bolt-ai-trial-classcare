import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamReportService } from '../exam-report.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-exam-report-list',
  templateUrl: './exam-report-list.component.html',
  styleUrls: ['./exam-report-list.component.scss']
})
export class ExamReportListComponent implements OnInit, OnChanges {
  @Input() examReportData: any; // Second, decorate the property with
  @Input() params: any; // Second, decorate the property with
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  @ViewChild('editExamReportMdl') editExamReportMdl: ElementRef | undefined;
  constructor(
    private examReportService: ExamReportService,
    private modalService: NgbModal
  ) { }

  URLConstants = URLConstants;
  results: any = [];
  examTypes: any = [];
  headers: any = {}
  studentExamData: any;

  tbody: any = []
  ngOnInit(): void {
    console.log(this.examReportData);

    this.setData()
  }

  refreshData() {
    console.log("getList");

    this.getlist()
  }

  ngOnChanges() {
    this.setData()
  }

  setData() {
    this.headers = this.examReportData.subjects;
    this.examTypes = Object.values(this.examReportData.examTypes);
    Object.assign(this.headers, this.examReportData.subjects);

    var data: any = [];
    this.examReportData.students.map((student: any) => {
      var total = 0;
      var examTotalMarks = 0;
      let failArray: any = [];
      var subjects: any = [];
      Object.keys(this.headers).map((record: any, i) => {
        var filteredElement: any = Object.values(student?.exam?.subjects)?.find((element: any) => {
          return element.subject_id == record
        });
        subjects[i] = filteredElement
        total += filteredElement ? filteredElement.marks : 0;
        examTotalMarks += filteredElement ? parseFloat(filteredElement.marks_total) : 0;
        if ((filteredElement.marks + (filteredElement?.graceMarks ? filteredElement?.graceMarks?.krupa_gun : 0) + (filteredElement?.graceMarks ? filteredElement?.graceMarks?.siddhi_gun : 0)) < parseInt(filteredElement.passing_marks)  && filteredElement.is_optional == 0) {
          failArray.push(filteredElement.subject_id)
        }
      });
      data.push({
        id: student.id,
        rollno: student.student_roll_number.rollno,
        student_name: student.full_name,
        subjects: subjects,
        total: total,
        exam: student.exam,
        percentage: ((total * 100) / examTotalMarks).toFixed(2),
        grade: student.exam.grade,
        result: failArray.length > 0 ? 'Fail' : 'Pass',

      })

    })
    this.results = data;
  }

  getlist() {
    this.examReportService.getStudentMarks(this.params).subscribe((resp: any) => {
      this.examReportData = resp
      this.setData()
    })
  }

  updateMarksMdl(student: any) {
    console.log(student);
    this.studentExamData = student
    this.modalService.open(this.editExamReportMdl, { size: 'xl', backdrop: 'static' });
  }

}
