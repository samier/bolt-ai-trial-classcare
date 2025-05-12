import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HostelManagementService } from '../../hostel-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-floor',
  templateUrl: './create-floor.component.html',
  styleUrls: ['./create-floor.component.scss']
})
export class CreateFloorComponent implements OnInit {

  @ViewChild('createFloorMdl') createFloorMdl: ElementRef | undefined;
  @Output() reloadWings = new EventEmitter<void>();
  @Input() wing: any;
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
    wing_name : null,
    name: null
  };
  ngOnInit(): void {
    this.params.wing_id = this.wing.id
    this.params.wing_name = this.wing.name
  }

  submit() {
    this.HostelManagementService.createFloorDetail(this.params).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.clearForm();
          this.modalService.dismissAll();
          this.reloadWings.emit();
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
      wing_name: null,
      name: null
    };
  }
}
