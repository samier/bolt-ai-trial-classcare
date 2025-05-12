import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { ActivatedRoute } from '@angular/router';
import { NullChannel } from 'laravel-echo/dist/channel';
import { UserService } from '../user.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  submitted:any = false;
  public branch = window.localStorage?.getItem('branch');
  user_id = null;
  constructor(
    private UserService: UserService,
    public datePipe: DatePipe,
    private activatedRouteService: ActivatedRoute,
    private toastr: Toastr
  ) {}

  URLConstants = URLConstants;
  fileName:any = "";
  imagebase64:any = null
  @ViewChild('inputFile') inputFile!: ElementRef;

  ngOnInit(): void {
    this.user_id = this.activatedRouteService.snapshot.params['id'];
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getList(dataTablesParameters, callback);
      },
      columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'action' },
      ],
    };
    $('#mymodal').css('z-index', '0');
  }

  getList(dataTablesParameters?: any, callback?: any) {
    Object.assign(dataTablesParameters, { faculty_id: this.user_id });
    this.UserService
      .UserDocumentList(dataTablesParameters)
      .subscribe((resp: any) => {
        this.tbody = resp.data;
        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        });
      });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  paginatedRecords(url: any): void {
    // this.UserService.paginatedRecords(url).subscribe((res: any) => {
    //   this.tbody = res.data;
    // });
  }

  onFileSelected(event: any) {
    let file = event.target.files[0];
    this.convertToBase64(file);
  }

  convertToBase64(file:any) {
    if (file) {
      const reader:any = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagebase64 = reader.result.split(',')[1] as string;
      };
    }
  }

  submit(){
    this.submitted = true;
    if(this.fileName && this.imagebase64){
        let data = {
          fileName : this.fileName,
          imagebase64 : this.imagebase64,
          faculty_id: this.user_id,
        }

        this.UserService.uploadUserDocument(data).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess('Document uploaded successfully.')
          }else{
            this.toastr.showError(resp.message)
          }
          this.reloadData()
          this.clear();
        })
    }
    
  }

  download(id:any){
    this.UserService.UserDocumentDownload(id).subscribe((resp:any) =>{ 
        if(resp.success){
          console.log(resp.url);
          
          window.open(resp.url, "_blank");
        }
    })
  }

  delete(id:any){
    let confirm = window.confirm('Are you sure wnt to delete this record?')
    if(confirm){
      this.UserService.UserDocumentDelete(id).subscribe((resp:any) =>{
        if(resp.status){
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
        this.reloadData();
      })
    }
  }

  clear(){
    this.submitted = false;
    this.fileName = null;
    this.imagebase64 = null;
    this.inputFile.nativeElement.value = "";
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }
}
