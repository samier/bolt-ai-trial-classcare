import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExamReportService } from '../../exam-report.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-edit-exam-report-modal',
  templateUrl: './edit-exam-report-modal.component.html',
  styleUrls: ['./edit-exam-report-modal.component.scss']
})
export class EditExamReportModalComponent implements OnInit {
  @ViewChild('editExamMdl') editExamMdl: ElementRef | undefined;
  @Output() refreshData = new EventEmitter<string>();

  @Input() mdlData: any;
  @Input() examTypes: any;
  @Input() params: any;
  subjects: any;
  grandStatus: any = 1;
  forms: any = {
    subjects: {}
  };
  constructor(
    private modalService: NgbModal,
    private examReportService: ExamReportService,
    private toastr: Toastr
  ) { }

  ngOnInit(): void {
    this.subjects = Object.values(this.mdlData.exam?.subjects);
    this.examTypes.map((type) => {
      return {
        exam_Type_id: type.exam_Type_id
      }
    })
    var grandTotal: any = 0;
    this.subjects.map((row) => {
      var totalMarks = 0
      var records: any = [];
      this.examTypes.map((record, i) => {
        const filteredElement = row.exam_report_types.find((element) => {
          return element.exam_type_id == record.exam_type_id
        });
        records[i] = filteredElement ? filteredElement : {}
        totalMarks += records[i].converted_marks ? records[i].converted_marks : 0
      });
      row.exam_report_types = records
      if (!row.graceMarks) {
        Object.assign(row, {
          graceMarks: {
            krupa_gun: 0,
            siddhi_gun: 0
          }
        })
      }
      row.marks = totalMarks
      row.krupa_siddhi_total = row.marks + row.graceMarks.krupa_gun + row.graceMarks.siddhi_gun
      grandTotal += row.krupa_siddhi_total
      row.passing_status = row.passing_marks <= row.krupa_siddhi_total ? 'Pass' : 'Fail'
      if (row.passing_status == 'Fail') {
        this.grandStatus = 0
        // this.mdlData.exam.grade = 0
      }
    });
    this.mdlData.exam.obtained_marks_total = grandTotal
  }

  truncateNumber(num: number): number {
    return Math.trunc(num);
  }

  close() {
    this.modalService.dismissAll()
  }

  save() {

    Object.assign(this.forms, {
      student: this.params,
      student_id: this.mdlData.id,
      rollno: this.mdlData.rollno,
      student_name: this.mdlData.student_name,
      subjects: this.subjects
    })

    this.examReportService.updateExamReport(this.forms).subscribe((resp: any) => {
      if (resp.status) {
        this.toastr.showSuccess(resp.message);
        this.refreshData.emit();
        this.close()
      } else {
        this.toastr.showError(resp.message)
      }

    });
  }

  calculate(event: any, s: number) {
    var grandTotal: any = 0;
    this.grandStatus = 1
    this.subjects.map((row, j) => {
      var totalMarks = 0
      var records: any = [];
      this.examTypes.map((record, i) => {
        const filteredElement = row.exam_report_types.find((element) => {
          return element.exam_type_id == record.exam_type_id
        });
        records[i] = filteredElement ? filteredElement : {}

        var total_marks = records[i].total_marks
        var conversion = records[i].conversion
        var converted_marks = (records[i].marks * conversion) / total_marks
        records[i].converted_marks = Math.round(converted_marks)
        totalMarks += records[i].converted_marks ? records[i].converted_marks : 0
      });
      row.exam_report_types = records
      row.marks = totalMarks
      row.krupa_siddhi_total = row.marks + row.graceMarks.krupa_gun + row.graceMarks.siddhi_gun
      grandTotal += row.marks

      console.log(row.graceMarks);


      row.passing_status = row.passing_marks <= row.krupa_siddhi_total ? 'Pass' : 'Fail'
      if (row.passing_status == 'Fail') {
        this.grandStatus = 0
        // this.mdlData.exam.grade = 0
      }
    });
    this.mdlData.exam.obtained_marks_total = grandTotal

  }

}
