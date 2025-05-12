import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Toastr } from 'src/app/core/services/toastr';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { TimetableService } from '../../timetable/timetable.service';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent {
  dtOptions: DataTables.Settings = {};
  datatableElement: DataTableDirective | null = null;
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    private http: HttpClient,
    private activatedRouteService: ActivatedRoute
  ) {}

  teacher:any;
  proxyLectures:any;
  URLConstants = URLConstants;
  timetable:any = [];
  filterTimetable:any = []
  search:any = null
  page = 1;
  current_page:any = null;
  last_page:any = null
  timer:any = 0
  user_id:any = ''
  ngOnInit() {
    this.user_id = this.activatedRouteService.snapshot.params['id'];
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        { data: 'id' },
        { data: 'teacher_name' },
        { data: 'lecture_name' },
        { data: 'batch' },
        { data: 'subject' },
        { data: 'room' },
        { data: 'proxy_teacher_name' },
        // { data: 'action', orderable: false, searchable: false },
      ],
    };
    // this.getTeachersTimetable()
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      faculty_id : this.user_id,
      search: null,
    };

    this.TimetableService.getTimetableByUser(dataTablesParameters).subscribe(
      (resp: any) => {
        this.teacher = resp.data;
        this.proxyLectures = resp.data.proxy_lectures?.original?.data ?? [];
        callback ? callback({
          recordsTotal: resp.data?.proxy_lectures?.length == 0 ? resp.data.proxy_lectures.original.recordsTotal : 0,
          recordsFiltered: resp.data?.proxy_lectures?.length == 0 ? resp.data.proxy_lectures.original.recordsFiltered : 0,
          data: [],
        }) : null;
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      }
    );
  }

  getTeachersTimetable(){   
    this.TimetableService.getTimetableByUser({faculty_id : this.user_id}).subscribe((resp:any) => {
      if(resp.status){
        this.timetable =  resp.data
        this.filterTimetable = resp.data
        this.current_page = resp.data.current_page
        this.last_page = resp.data.last_page
        console.log(this.filterTimetable);
        
      }
    })
  }

  loadMore(){
    this.page = this.page + 1;
    this.TimetableService.getTeachersTimetable(this.page, this.search).subscribe((resp:any) => {
      if(resp.status){
        this.timetable = this.timetable.length > 0 ? this.timetable.concat(resp.data.data) : resp.data.data
        this.filterTimetable = this.filterTimetable.length > 0 ? this.filterTimetable.concat(resp.data.data) : resp.data.data
        this.current_page = resp.data.current_page
        this.last_page = resp.data.last_page
      }
    })
  }
  getTime(item: any) {
    const time =
      item.substring(0, 2) <= 12
        ? item.substring(0, 5)
        : item.substring(0, 2) - 12 + item.substring(2, 5);

    const ampm = item.substring(0, 2) < 12 ? 'AM' : 'PM';

    return time + ' ' + ampm;
  }

  handleSearch(){

    this.page = 1
    clearTimeout(this.timer);

    this.timer = setTimeout(async() => {
      this.getTeachersTimetable()
    }, 400);
  }

  downloadTeachersTimetable(format:any){
    let data = {
      search : this.search
    }
    this.TimetableService.downloadTeachersTimetable(format, data).subscribe((response: any) => {
      if(this.timetable.length == 0){
        return this.toastr.showInfo('There is no records','INFO');
      }
     let blob:Blob = response.body as Blob;
     if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = window.URL.createObjectURL(blob);
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
     } else {
      let a = document.createElement('a');
      a.download = 'Teachers Timetable';
      let pdfSrc = window.URL.createObjectURL(blob)
      a.href =  pdfSrc
      a.click();
      }
     
    }) 
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
}
