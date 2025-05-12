import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HostelManagementService } from '../../hostel-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-floor',
  templateUrl: './edit-floor.component.html',
  styleUrls: ['./edit-floor.component.scss']
})
export class EditFloorComponent implements OnInit {

  @ViewChild('editMdl') editMdl: ElementRef | undefined;
  @Output() reloadFloors = new EventEmitter<void>();
  @Input() floor: any;
  constructor(
    private HostelManagementService: HostelManagementService,
    private toastr: Toastr,
    private router:Router,private route: ActivatedRoute,
    private modalService: NgbModal,
  ) {
  }
  validationError: any = [];
  floors: any = [];

  params = {
    wing_id: null,
    name: null
  };
  ngOnInit(): void {
    this.HostelManagementService.singlefloorList(this.floor.id).subscribe(
      (resp: any) => {
        let floorData = resp.data;
        this.HostelManagementService.getWingList([]).subscribe(
          (resp: any) => {
            this.floors = resp.data;
            this.params.wing_id = this.floor.wing_id;
          }
        );
      }
    );
    this.params.name = this.floor.name
  }

  submit() {
    this.HostelManagementService.updateFloorDetail(this.params, this.floor.id).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.clearForm();
          this.modalService.dismissAll();
          this.reloadFloors.emit();
        } else {
          this.validationError = resp.error
          this.toastr.showError(resp.message)
        }
      }
    );
  }

  close() {
    this.modalService.dismissAll()
    this.clearForm()
  }

  clearForm() {
    this.params = {
      wing_id: null,
      name: null
    };
  }

}
