import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ResultService } from '../../result.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
    selector: 'app-mark-calculation',
    templateUrl: './mark-calculation.component.html',
    styleUrls: ['./mark-calculation.component.scss']
})
export class MarkCalculationComponent implements OnInit {
    //#region Public | Private Variables

    $destroy: Subject<void> = new Subject<void>();
    selectedSubjects: any = [];
    markSheetClassId: string | null = null;
    @Output() next:any = new EventEmitter<any>();

    data: any 
    isMarkCalculation : boolean = false

    multiSelectDropdownSettings: IDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
    };


    //#endregion Public | Private Variables

    // --------------------------------------------------------------------------------------------------------------
    // #region constructor
    // --------------------------------------------------------------------------------------------------------------

    constructor(public CommonService: CommonService,
        private _fb: FormBuilder,
        private _resultService: ResultService,
        private _activatedRoute: ActivatedRoute,
        private _toaster: Toastr
    ) { }

    //#endregion constructor

    // --------------------------------------------------------------------------------------------------------------
    // #region Lifecycle hooks
    // --------------------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.markSheetClassId = this._activatedRoute.snapshot.paramMap.get('id') || null;
        this.getMarkCalculationList()
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    //#endregion Lifecycle hooks

    // --------------------------------------------------------------------------------------------------------------
    // #region Public methods
    // --------------------------------------------------------------------------------------------------------------

    onSubjectSelect(selectedItems, section) {
        if (selectedItems) {
            section?.addational_subjects?.forEach(subject => subject.is_additional_subject = 0);
            selectedItems?.forEach(selected => {
                const foundSubject = section.addational_subjects.find(subject => subject.id === selected.id);
                if (foundSubject) {
                    foundSubject.is_additional_subject = 1;
                }
            });
        }
    }

    onSave() {
        
        let mergeData = this.data.section_details;
        if (this.data?.CoScholastic) {
            mergeData = [...mergeData, this.data.CoScholastic]
        }

        if (this.data?.skill_subjects) {
            mergeData = [...mergeData, this.data.skill_subjects]
        }


        const filteredData = mergeData.map(section => ({
            ...section,
            subjects: section.subjects.map(subject => ({
                ...subject,
                exams: subject.exams.filter(exam => exam.is_exist)
            }))
        }));

        const payload = {
            mark_sheet_classes_id: this.markSheetClassId,
            section_details: filteredData
        }
        
        this._resultService.storeSubjectSetupMarkCalculation(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
            if (res.status) {
                this._toaster.showSuccess(res.message);
                this.next.emit();
            } else {
                this._toaster.showError(res.message);
            }
        }, (error) => {
            this._toaster.showError(error?.message ?? error?.error?.message);
        })
    }

    //#endregion Public methods

    // --------------------------------------------------------------------------------------------------------------
    // #region Private methods
    // --------------------------------------------------------------------------------------------------------------

    getMarkCalculationList() {
        this.isMarkCalculation = true
        const payload = {
            mark_sheet_classes_id: this.markSheetClassId
        }

        this._resultService.getSubjectSetupMarkCalculation(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
            this.isMarkCalculation = false
            if (res.status) {
                this.data = res.data;

                const section_details = this.data.section_details.filter(ele => !ele.is_co_scholastic && !ele.is_skill_subject);
                const CoScholastic = this.data.section_details.find(ele => ele.is_co_scholastic);
                const skill_subjects = this.data.section_details.find(ele => ele.is_skill_subject);

                this.data = {
                    section_details: section_details,
                    CoScholastic: CoScholastic,
                    skill_subjects: skill_subjects,
                }
                this.selectedSubjects = this.data.section_details.map(section =>
                    section.addational_subjects.filter(subject => subject.is_additional_subject == 1)
                );
                
            } else {
                this._toaster.showError(res.message);
            }
        }, (error) => {
            this.isMarkCalculation = false
            this._toaster.showError(error?.message ?? error?.error?.message);
        })
    }


    //#endregion Private methods
}