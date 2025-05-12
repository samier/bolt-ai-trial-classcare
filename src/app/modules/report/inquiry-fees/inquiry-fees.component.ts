import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-inquiry-fees',
  templateUrl: './inquiry-fees.component.html',
  styleUrls: ['./inquiry-fees.component.scss']
})
export class InquiryFeesComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  inquiryFeesReportFilterForm: FormGroup = new FormGroup({})
  filter: any = false;
  filterCount: number = 0
  sectionList
  classList
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  inquiryFeesReportData
  isExcelLoading: boolean = false
  isPdfLoading: boolean = false
  isShow: boolean = false


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private reportService: ReportService,
    private _toaster: Toastr,
    private _dateFormateService: DateFormatService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.getClassesList();
    this.initDatatable()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  clearAll(event: any = null) {
    if (event) {
      event.stopPropagation();
    }
    this.inquiryFeesReportFilterForm.reset();
    this.getClassesList();
    this.reloadData();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  showdData() {
    this.isShow = true
    this.reloadData();
  }

  exportInquiryFees(format) {
    if (format == 'pdf') {
      this.isPdfLoading = true;
    }
    else {
      this.isExcelLoading = true;
    }

    const payload = {
      class_id : this.inquiryFeesReportFilterForm.value?.class_id?.length > 0 ? this.inquiryFeesReportFilterForm.value.class_id.map(ele => ele.id) : null,
      section_id : this.inquiryFeesReportFilterForm.value?.section_id?.length > 0 ? this.inquiryFeesReportFilterForm.value.section_id.map(ele => ele.id) : null,
      start_date : this.inquiryFeesReportFilterForm?.value?.date && this.inquiryFeesReportFilterForm?.value?.date?.startDate ? this.inquiryFeesReportFilterForm.value.date.startDate.format('YYYY-MM-DD') : null,
      end_date : this.inquiryFeesReportFilterForm?.value?.date && this.inquiryFeesReportFilterForm?.value?.date?.endDate ? this.inquiryFeesReportFilterForm.value.date.endDate.format('YYYY-MM-DD') : null,
    }

    this.reportService.downloadInquiryFeesReport(payload, format).subscribe(async (res: any) => {
      this.isPdfLoading = false;
      this.isExcelLoading = false;
      if (res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if (data.status == false) {
          this._toaster.showError(data.message);
        }
      } else {
        this.CommonService.downloadFile(res, 'Inquiry_Fees', format);
      }
    }, (error) => {
      this.isPdfLoading = false;
      this.isExcelLoading = false;
      this._toaster.showError(error?.error?.message ?? error?.message);
    })
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.inquiryFeesReportFilterForm = this._fb.group({
      section_id: [null],
      class_id: [null],
      date: [null]
    })
  }

  getSectionList() {
    this.reportService.getSectionList({ school: "" }).subscribe((res: any) => {
      if (res.status) {
        // this.sectionList = [{ id: '', name: 'All Section' }].concat(res?.data);
        this.sectionList = res?.data;
      }
    });
  }

  getClassesList() {
    this.classList = [];
    this.inquiryFeesReportFilterForm.get('class_id')?.patchValue(null);
    this.reportService.getStudentClassList(this.inquiryFeesReportFilterForm.value.section_id).subscribe((res: any) => {
      // this.classList = [{ id: '', name: 'All Class' }].concat(res?.data);
      this.classList = res?.data;
    });
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.inquiryFeesReportFilterForm.value).forEach((item: any) => {
      if (this.inquiryFeesReportFilterForm.value[item] != '' && this.inquiryFeesReportFilterForm.value[item] != null) {
        this.filterCount++;
      }
    })
    if (this.inquiryFeesReportFilterForm.value?.payment_date && this.inquiryFeesReportFilterForm.value?.payment_date?.startDate == null) {
      this.filterCount--;
    }
  }

  initDatatable() {
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { title: 'Sr no.', orderable:false, render: (data, type, row, meta) => meta.row + 1 },
        { title: 'Section', data: 'inquiry.class.section.name' },
        { title: 'Class', data: 'inquiry.class.name',className:'teal-text-color', defaultContent: '-' },
        { title: 'Name', data: 'inquiry.first_name', defaultContent: '-' },
        {
          title: 'Date', data: 'ifc_created_at', defaultContent: '-', orderable:false,
          "render": function (data) {
            return moment(data).format(that._dateFormateService.getFormat())
          }
        },
        { title: 'Fees Amount', data: 'amount', className:'orange-text-color', defaultContent: '-' },
        // {
        //   title: 'Action',
        //   data: null,
        //   orderable: false,
        //   searchable: false,
        //   render: (data, type, row) => {
        //     return `
        //     <div class="btn-group">
        //       <button class="btn action-edit" data-id="${row.ifc_id}" title="Edit"> <i class="fa fa-pencil-alt"></i> </button>
        //       <button class="btn action-delete" data-id="${row.ifc_id}" title="Delete"> <i class="fa fa-trash-alt"></i> </button>
        //       <button class="btn action-view" data-id="${row.ifc_id}" title="View"> <i class="fa fa-eye"></i> </button>
        //     </div>
        //     `;
        //   }
        // }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();

    const payload = {
      class_id : this.inquiryFeesReportFilterForm.value?.class_id?.length > 0 ? this.inquiryFeesReportFilterForm.value.class_id.map(ele => ele.id) : null,
      section_id : this.inquiryFeesReportFilterForm.value?.section_id?.length > 0 ? this.inquiryFeesReportFilterForm.value.section_id.map(ele => ele.id) : null,
      start_date : this.inquiryFeesReportFilterForm?.value?.date && this.inquiryFeesReportFilterForm?.value?.date?.startDate ? this.inquiryFeesReportFilterForm.value.date.startDate.format('YYYY-MM-DD') : null,
      end_date : this.inquiryFeesReportFilterForm?.value?.date && this.inquiryFeesReportFilterForm?.value?.date?.endDate ? this.inquiryFeesReportFilterForm.value.date.endDate.format('YYYY-MM-DD') : null,
    }

    this.reportService.getInquiryFeesReport(Object.assign(dataTablesParameters, payload)).subscribe((resp: any) => {
      this.isShow = false
      this.inquiryFeesReportData = resp?.data;
      callback({
        recordsTotal: resp?.recordsFiltered,
        recordsFiltered: resp?.recordsFiltered,
        data: this.inquiryFeesReportData
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  //#endregion Private methods
}