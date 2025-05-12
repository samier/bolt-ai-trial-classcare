import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { enviroment } from '../../../../environments/environment.staging';

@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.scss']
})
export class QuestionViewComponent {

  constructor(
      private activatedRouteService: ActivatedRoute,
      private mcqService: McqManagementService
  ) {}

  URLConstants = URLConstants;
  question: any = [];
  image: any = null;
  id: any = null;

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.mcqService.getQuestionDetail(this.id).subscribe((res:any) => {  
        this.question = res.data;
      });
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getImage(){
    // return enviroment.symfonyHost.replace(/\/app_dev.php\//gi, "")+'/'+this.question.image; 
    return this.question.image; 
  }

  getAnswer(){
    switch (this.question.answer) {
      case 1:
        return this.question.option_one;
      case 2:
        return this.question.option_two;
      case 3:
        return this.question.option_three;
      case 4:
        return this.question.option_four;
      case 5:
        return this.question.option_five;
      default:
        break;
    }
  }
}
