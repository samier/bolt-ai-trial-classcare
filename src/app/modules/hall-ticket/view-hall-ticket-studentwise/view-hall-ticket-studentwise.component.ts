import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { HallTicketService } from '../hall-ticket.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-hall-ticket-studentwise',
  templateUrl: './view-hall-ticket-studentwise.component.html',
  styleUrls: ['./view-hall-ticket-studentwise.component.scss']
})
export class ViewHallTicketStudentwiseComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  URLConstants = URLConstants;
  tbody: any;
  hallTicketId: any;
  selectAll : boolean = false
  isDownload : boolean = false
  batchName : string = ''
  feeStatus :number = 0
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      public hallTicketService : HallTicketService,
      private toastr : Toastr,
      private _activatedRoute : ActivatedRoute
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this._activatedRoute.params.subscribe(params => {
      this.hallTicketId = params['id'];
      // Do something with the parameters
      if (this.hallTicketId) {
       this.initStudentwiseDataTable()
      }
    });
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  studentHallTicketDownload(id: any) {
    const ids = Array.isArray(id) ? id : [id]
    const payload = {
      hall_ticket_ids : ids
    }
    this.hallTicketService.downloadHallTicket(payload, this.hallTicketId).subscribe((resp:any) => {
      this.isDownload = false
      this.downloadFile(resp, 'hall-ticket', 'pdf');
      this.checkSelectAll(false)
    }, (err:any) => {
      this.isDownload = false
      this.toastr.showError(err.error.message);
    });
  }

  selectionChange() {
    const selection = this.tbody?.map((ele:any) => ele.isSelect);
    if (selection.includes(false)) {
      this.selectAll = false
    } else {
      this.selectAll = true
    }
  }

  checkSelectAll(event:any) {
    this.tbody?.forEach((element:any) => {
      element.isSelect = event
    });
    this.selectAll = event
  }

  download() {
    const ids = this.tbody?.filter(ele => ele.isSelect)?.map(ele => ele.id)
    if(ids.length > 0){
      this.isDownload = true
      this.studentHallTicketDownload(ids)
    } else {
      window.alert('Please select student')
    }
  }

  publishHallTicket(item?:any){
    const ids = item?.id ? [item?.id] : this.tbody?.filter((ele:any) => ele?.isSelect)?.map((ele:any) => ele?.id) || []
    if(ids.length ==0){
      this.toastr.showError("Please Check the Checkbox");
      return 
    }
    const payload = {
      id : ids,
    }
    this.hallTicketService.publishHallTicket(payload).subscribe((res:any) => {
      if(res.status){
        this.toastr.showSuccess(res.message)
        this.tbody.forEach((row:any)=>{
          row.isSelect = false
        })
        this.reloadData()
      }
      else{
        this.toastr.showError(res.message);
      }
    },(error:any)=>{
      this.toastr.showError( error.error.message || error.message );
    })
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  downloadFile(res: any, file: any, format: any) {
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob);
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 200);
      //iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc;
      a.click();
    }
  }

  initStudentwiseDataTable () {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'id' , orderable: false, searchable: false },
        { data: 'student_name' },
        { data: 'hall_ticket_status' },
        { data: 'fees_status' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }

  loadData(dataTablesParameters, callback) {

    this.hallTicketService.getStudentHallTicketList({...dataTablesParameters , fees_status : this.feeStatus===0 ? null : this.feeStatus },this.hallTicketId).subscribe((resp:any) => {
      this.tbody =  resp.data.original.data;
      this.batchName = resp.data.original.data[0].batch ?? '';
      this.tbody.forEach(element => {
        element.isSelect = false
      });
      callback({
        recordsTotal: resp.data.original.recordsTotal,
        recordsFiltered: resp.data.original.recordsFiltered,
        data: []
      });
    });
  }
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  } 
	
  //#endregion Private methods
}