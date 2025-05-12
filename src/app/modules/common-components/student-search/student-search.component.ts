import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';
import { WalletService } from '../../fees/wallet/wallet.service';

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})
export class StudentSearchComponent implements OnInit {

  URL_id:any
  searching = false;
  focusOnList = true;
  searchBar:any = '';
  students:any;
  @Input() inActive:boolean = false;
  @Input() isDisabled:boolean = false;
  @Input() selectedSectionId: any = '';
  private searchTerms = new Subject<string>();
  @Output() student = new EventEmitter<any>();

  constructor( 
    public sharedUserService: SharedUserService,
    private route: ActivatedRoute,
    private WalletService: WalletService,
  ) { 
    this.searchTerms.pipe(
      debounceTime(300), 
      distinctUntilChanged()
    ).subscribe(search => {
      this.getStudentsList(search);
    });
  }

  ngOnInit(): void {
    this.getStudentsList();
    this.URL_id = this.route.snapshot.paramMap.get('id');

    if(this.URL_id){
      const temp = {
        start_date : "",
        end_date : "",
        student_unique_id : this.URL_id 
      }

      this.WalletService.getWalletHistory(temp).subscribe(
        (resp: any) => {
          this.searchBar=resp.student_name
        }
      );
    }
  }

  onSearch(){
    this.searchTerms.next(this.searchBar);
  }

  getStudentsList(search: any = null) {
    this.students = [];
    if(search?.length > 1){
      this.sharedUserService.searchStudent({input: search, inActive: this.inActive, section_id: this.selectedSectionId}).subscribe((resp:any) => {
        this.students = resp.data;    
      }) 
    }
  }

  onSelect(student:any){
    this.searchBar = student.full_name+ ' | '+student?.batch?.[0]?.name+(student?.studentId ? (' | '+student?.studentId) : "") ;
    this.student.emit(student);
  }

  clear(){
    this.students = [];
    this.searchBar = null;
    this.student.emit({});
  }

}
