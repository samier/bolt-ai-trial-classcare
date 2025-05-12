import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { subjectService } from '../subject.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';
import {CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'subject-order',
  templateUrl: './subject-order.component.html',
  styleUrls: ['./subject-order.component.scss'],
  animations: [
    trigger('itemAnimation', [
      transition('void => *', [
        style({ transform: 'translateY(-20%)', opacity: 0 }),
        animate('300ms ease-out'),
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({ transform: 'translateY(-20%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class subjectComponent {
  URLConstants = URLConstants;
    constructor(
      private subjectService: subjectService,
      private toastr: Toastr,
      private activatedRouteService: ActivatedRoute,
    ) {}

    course_id = null
    subjects = [];
    class:any = null
    draggedItemIndex: any = null;

    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.course_id = this.activatedRouteService.snapshot.params['id'];
      
      let data = {
        course_id: this.course_id,
      };
      this.subjectService.getSubjects(data).subscribe((resp:any) => {
        if(resp.status){
          this.subjects = resp.data.subjects
          this.class = resp.data.class
        }
      })
      
    }

    drop(event: CdkDragDrop<string[]>) {
      const subject_id = event.item.data;
      moveItemInArray(this.subjects, event.previousIndex, event.currentIndex);
      this.updateOrder(this.subjects);
    }

    updateOrder(data:any){
      this.subjectService.updateOrder({subjects: data}).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
        }
      })
    }
    
}
