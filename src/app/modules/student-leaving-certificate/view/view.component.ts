import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { StudentLeavingCertificateService } from '../student-leaving-certificate.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})

export class ViewComponent {
  //#region Public | Private Variables
  generate:boolean = false;
  URLConstants = URLConstants;
  student_id: any = null;
  lc:any = null;
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private activatedRouteService: ActivatedRoute,
    private toastr: Toastr,
    private leavingCertificateService: StudentLeavingCertificateService,
    public commonService: CommonService,
    private sanitizer: DomSanitizer
  ) {}  
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.student_id = this.activatedRouteService.snapshot.params['id'];
    if(this.student_id){
      this.leavingCertificateService.getpdfHtml(this.student_id,{'getHtml':true}).subscribe((res:any) => {        
        if(res.html){
          this.lc = this.sanitizer.bypassSecurityTrustHtml(res.html)   
        }
      });
    }

  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  generateLcPdf()
  {
    this.generate = true;    
    this.leavingCertificateService.view(this.student_id).subscribe(async(res:any) => {        
      if(res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if(data.status == false){
          this.toastr.showError(data.message);
        }
      } else {        
        this.commonService.downloadFile(res,'leaving-certificate', "pdf");        
      }  
      this.generate = false;    
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  //#endregion Public methods
}
