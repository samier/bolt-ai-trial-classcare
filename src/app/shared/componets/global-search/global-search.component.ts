import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalSearchService } from './global-search.service';
import { Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Toastr } from 'src/app/core/services/toastr';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {

  //public variables:
  academicYearList: any = []
  selectedTab: string = 'student';
  selectedAcademicYear: any = [];
  selectedBranch: number[] = [];
  searchSubscription: any
  page = 10
  pager: any = {
    perPage: 10,
    currentPage: 1,
    totalRecords: 0
  }
  searchQuery: string = '';
  studentData: any;
  facultyData: any;
  branchList: any = [];

  status: number | undefined = 0;
  // login_id: any = 1798;
  start: boolean = true;
  search: boolean = false;

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  
  male: any = 'https://' + enviroment?.symfonyDomain + '/public/images/student-male.png'
  female: any = 'https://' + enviroment?.symfonyDomain + '/public/images/student-female.png'

  male_professor   :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-male.png'
  female_professor :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-female.png'
  
  branchId : any = window.localStorage.getItem('branch');
  user_id  : any   = window.localStorage.getItem('user_id');
  currentYear_id : any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  permission:any;
  
  constructor(
    private activeModal: NgbActiveModal,
    private globalSearchService: GlobalSearchService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toaster: Toastr,
    public commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.getBranchList();
    const searchInput: any = document.querySelector('#search-input');
    this.searchSubscription = fromEvent(searchInput, 'input').pipe(
      map((e: any) => (e.target as HTMLInputElement).value),
      filter(text => !text.length || (text.trim().length > 1)),
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe((data: any) => {
      this.search = true
      this.pager = {
        perPage: this.pager.perPage.toString(),
        currentPage: 1,
        totalRecords: 0
      }
      if (!data) {
        this.studentData = []
        this.search = false
        return
        //empty
      } else {
        this.loadSearchData()
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription.remove()
  }

  loadSearchData(isInitLoad?) {
    if (this.selectedTab === 'student') {
      this.searchStudentData(isInitLoad)
    } else {
      this.searchFacultyData(isInitLoad)
    }
  }

  getBranchList() {
    this.setSelectDefaultBranch()
    this.selectAllForDropdownItems(this.branchList);
    if (this.selectedTab === 'student') {
      this.autoSelectYear();
    }
  }
  
  // for deFault branch Selection  
  setSelectDefaultBranch(callback?) {
    let selBranch = this.branchList.find(branch => branch.id == this.branchId)
    this.selectedBranch = [selBranch];
    if (callback) {
      callback()
    }
  }

  getAcadamicYearByBranch() {
    const requestPayload = {
      branches: this.selectedBranch.map((item: any) => item.id) || []
    }
    if (requestPayload.branches.length > 0) {
      this.globalSearchService.fetchAcademicYearListbyBranches(requestPayload).then((responseData) => {
        let academicYearGroupByList = []
        if (responseData?.data.length > 0) {
          responseData?.data?.forEach((item) => {
            const yearList = item.academic_year.map(ylist => ({ ...ylist, branchName: item?.branchName }))
            academicYearGroupByList = academicYearGroupByList.concat(yearList)
          })
        }
        this.academicYearList = academicYearGroupByList
        this.autoSelectYear();
      }).catch((error) => {
      });
    } else {
      this.academicYearList = [];
    }
  }
  
  autoSelectYear(){
    const selected_year = this.academicYearList.find(item => item.id == this.currentYear_id)?.year;
    const current_years = this.academicYearList.filter((year:any) => year.year == selected_year || this.selectedAcademicYear?.includes(year.id));
    this.selectedAcademicYear = current_years?.map(year => year.id);
    this.start = false    
  }

  groupValueFn = (i: string, children: any[]) => {
    return { branchName: children[0].branchName }
  };

  selectAllAcademicYears(val) {
    if (val) {
      this.selectedAcademicYear = this.academicYearList.map(year => year.id);
    } else {
      this.selectedAcademicYear = [];
    }
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = items => {
      items.forEach(element => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }

  searchStudentData(isInitLoad?): void {
    if (!isInitLoad && !this.selectedBranch.length) {
      this.toaster.showError("Please select at least one branch");
      this.search = false
      return
    }
    if (this.searchQuery.trim().length < 1) {
      this.search = false
      return
    }
    const requestPayload = {
      current_branch_id: this.selectedBranch.length > 0 ? this.selectedBranch.map((item: any) => item.id) : isInitLoad ? [this.branchId] : [],
      status: '0',
      search: this.searchQuery.trim(),
      academic_year_id: this.selectedAcademicYear.length > 0 ? this.selectedAcademicYear : [],
      start: this.pager.currentPage === 1 ? 0 : this.pager.perPage * (this.pager.currentPage - 1),
      length: Number(this.pager.perPage)
    }
    this.spinner.show();
    this.globalSearchService.searchStudent(requestPayload).then((responseData) => {
      this.studentData = responseData.data.data.original.data;
      this.permission = responseData.data.permission;
      this.pager.totalRecords = responseData.data.data.original.recordsTotal;
      this.spinner.hide();
      this.search = false
    }).catch((error) => {
      this.toaster.showError(error?.error?.message);
      this.spinner.hide();
      this.search = false
    });
  }

  searchFacultyData(isInitLoad?) {
    if (!isInitLoad && !this.selectedBranch.length) {
      this.toaster.showError("Please select at least one branch");
      return
    }
    const requestPayload = {
      current_branch_id: this.selectedBranch.length > 0 ? this.selectedBranch.map((item: any) => item.id) : isInitLoad ? [this.branchId] : [],
      search: this.searchQuery,
      start: this.pager.currentPage === 1 ? 0 : this.pager.perPage * (this.pager.currentPage - 1),
      length: this.pager.perPage
    }
    this.spinner.show();
    this.globalSearchService.searchFaculty(requestPayload).then((responseData) => {
      this.facultyData = responseData.data.original.data;
      this.pager.totalRecords = responseData.data.original.recordsTotal;
      this.spinner.hide();
      this.search = false
    }).catch((error) => {
      this.spinner.hide();
      this.search = false
    });
  }

  onTabSwitch(selectedTab) {
    this.selectedTab = selectedTab;
    this.resetData()
    this.setSelectDefaultBranch(() => {
      this.loadSearchData()
    })
  }

  resetData() {
    this.pager = {
      perPage: 10,
      currentPage: 1,
      totalRecords: 0
    }
    this.searchQuery = ''
    this.selectedAcademicYear = [];
    this.academicYearList = [];
  }

  onBranchSelect() {
    if (this.selectedTab === 'student') {
      this.getAcadamicYearByBranch()
      this.searchStudentData()
    } else {
      this.searchFacultyData()
    }
  }

  onAcademicYearSelect() {
    this.searchStudentData();
  }

  onPaginationChange(event) {
    this.loadSearchData()
  }

  clearBtn() {
    this.searchQuery = ''
    this.pager = {
      perPage: this.pager.perPage.toString(),
      currentPage: 1,
      totalRecords: 0
    }
    this.studentData = []
    // this.loadSearchData();
  }

  setsymfonyUrlProfile(url: string, id: any) {
    return this.symfonyHost + window.localStorage.getItem("branch") + '/' + url + '/' + id;
  }

  // setsymfonyUrl(url: string) {
  //   return (
  //     this.symfonyHost +
  //     window.localStorage.getItem('branch') +
  //     '/' +
  //     url +
  //     '/' +
  //     this.login_id
  //   );
  // }

  closeModal() {
    this.activeModal.close();
  }

  // setUrl(url:string, studentId) {
  //   return '/'+window.localStorage.getItem("branch")+'/'+url + '/' + studentId;
  // }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  getPhoto(obj:any){
    if(obj.profile_url){
      const profile_url = obj?.profile_url?.replaceAll('&amp;', '&');
      return profile_url
    }
    else{
      if(this.selectedTab == 'student' ){
        return obj.gender == 'm' ? this.male : this.female
      }
      else{
        return obj.gender == 'm' ? this.male_professor : this.female_professor
      }

    }

  }
  
  setsymfonyUrl(url: string,student:any) {

    const is_check = this.checkBranchndYear(student)

    if(is_check){
      return  this.symfonyHost + window.localStorage.getItem("branch") + '/' + url
    }
    return
  }

  navigateToProfile(event: Event, student: any , URL : any ) {
    event.preventDefault();

    const url = `${URL}/${student?.unique_id}` ;
    const isCheck = this.checkBranchndYear(student);
    if (isCheck) {
      const fullUrl = this.symfonyHost + 'app/' + window.localStorage.getItem("branch") + '/' + url
      window.location.href = fullUrl;
      // this.router.navigate([this.setUrl(url)]);
      // this.closeModal()
    }
  }


  checkBranchndYear(student: any) {

    // BRANCH DIFFERNENT
     if (student?.branch_id != this.branchId) {

      const is_confirm = window.confirm("This student is from another branch. do you want to switch ?")
      if (is_confirm) {
        document.cookie = ` academic_year_id= ${student?.academic_year_id}; expires=0; path=/ `
        document.cookie = ` current_branch_id= ${student?.branch_id}; expires=0; path=/ `
        sessionStorage.setItem('academic_year_id', student?.academic_year_id);
        localStorage.setItem('branch', student?.branch_id)
        return true
      }
      else return false
    }
    // YEAR DIFFERENT
    else if(student?.academic_year_id != this.currentYear_id) {
      const is_confirm = window.confirm("This student is from another academic year. do you want to switch ?")
      if (is_confirm) {
        document.cookie = ` academic_year_id= ${student?.academic_year_id}; expires=0; path=/ `
        sessionStorage.setItem('academic_year_id', student?.academic_year_id);
        return true
      }
      else return false
    }

    return true
  }

  handleLengthChange(){
    this.search = true;
    this.pager.currentPage = 1;
    this.loadSearchData()
  }

}
