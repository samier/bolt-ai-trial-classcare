import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ResultService } from '../result.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-marksheet-template-design',
  templateUrl: './marksheet-template-design.component.html',
  styleUrls: ['./marksheet-template-design.component.scss']
})
export class MarksheetTemplateDesignComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  @ViewChild('top_header', { static: true }) top_header!: any;
  @ViewChild('bottom_header', { static: true }) bottom_header!: any;
  @ViewChild('footer', { static: true }) footer!: any;
  templateForm: any;
  htmlContent:any = {};
  saving:boolean = false;
  URLConstants = URLConstants;
  template_variables:any;
  focusedElement:any;
  id:any;
  marksheet_body_templates:any;
  type:any = null

  editorConfig: AngularEditorConfig = {
      editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      toolbarHiddenButtons: [
        // [
        //   'undo',
        //   'redo',
        //   'bold',
        //   'italic',
        //   'underline',
        //   'strikeThrough',
        //   'subscript',
        //   'superscript',
        //   'justifyLeft',
        //   'justifyCenter',
        //   'justifyRight',
        //   'justifyFull',
        //   'indent',
        //   'outdent',
        //   'insertUnorderedList',
        //   'insertOrderedList',
        //   'heading',
        //   'fontName'
        // ],
        [
          // 'fontSize',
          // 'textColor',
          // 'backgroundColor',
          // 'customClasses',
          'link',
          'unlink',
          'insertImage',
          'insertVideo',
          'insertHorizontalRule',
          'removeFormat',
          // 'toggleEditorMode',
        ],
      ],
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
};
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
      private resultService: ResultService,
      public commonService: CommonService,
      private _fb : FormBuilder,
      private toastr : Toastr,
      private _activatedRoute : ActivatedRoute,
      private formValidationService : FormValidationService,
      private _router : Router
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.id = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.type = this._activatedRoute.snapshot.paramMap.get('type') || null
    this.getTemplateVariables();
    this.getMarksheetBodyTemplates();
    this.initForm();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  createTemplate(){
    if(this.top_header?.editorToolbar?.htmlMode){
      this.top_header.toggleEditorMode(false);
    }
    if(this.bottom_header?.editorToolbar?.htmlMode){
      this.bottom_header.toggleEditorMode(false);
    }
    if(this.footer?.editorToolbar?.htmlMode){
      this.footer.toggleEditorMode(false);
    }

    setTimeout(()=>{
      this.templateForm?.get('top_header').setValue(this.top_header?.textArea?.nativeElement?.innerHTML || null);
      this.templateForm?.get('bottom_header').setValue(this.bottom_header?.textArea?.nativeElement?.innerHTML || null);
      this.templateForm?.get('footer').setValue(this.footer?.textArea?.nativeElement?.innerHTML || null);
      this.templateForm.touched = true;
      if(this.templateForm.invalid){
        this.formValidationService.getFormTouchedAndValidation(this.templateForm);
        return;
      }
      this.saving = true;
      this.resultService.saveTemplate(this.templateForm.value,this.id).subscribe(
        (response:any)=>{
          if(response?.status){
            this.toastr.showSuccess(response?.message);
            this._router.navigate([this.commonService.setUrl(URLConstants.MARKSHEET_TEMP_LIST)]);
          }else{
            this.toastr.showError(response?.message);
          }
          this.saving = false;
        },
        (error:any)=>{
          this.toastr.showError(error?.error?.message);
          this.saving = false;
        }
      );
    },100);

  }

  clearForm(){
    if(this.id){
      this.getTemplate();
    }else{
      this.templateForm.reset();
      this.htmlContent = {};
    }
  }

  getTemplateVariables(){
    this.resultService.getTemplateVariables().subscribe((response:any)=>{
      this.template_variables = response.data;
    })
  }

  getMarksheetBodyTemplates(){
    this.resultService.getMarksheetBodyTemplates().subscribe((response:any)=>{
      this.marksheet_body_templates = response.data;
      if(this.id) {
        this.getTemplate();
      }
    })
  }

  getTemplate(){
    if(this.id){
      this.resultService.getTemplate(this.id).subscribe((response:any)=>{
        this.templateForm.patchValue({
          template_name: response?.data?.template_name,
          certificate_template_id: response?.data?.certificate_template_id ?? 1,
          template_type: response?.data?.template_type ?? 0,
          top_header: response?.data?.top_header || null,
          bottom_header: response?.data?.bottom_header || null,
          footer: response?.data?.footer || null,
        })
        this.htmlContent.top_header = response?.data?.top_header ?? null;
        this.htmlContent.bottom_header = response?.data?.bottom_header ?? null;
        this.htmlContent.footer = response?.data?.footer ?? null;
        this.handleBodyTemplateSelect(this.templateForm.value.certificate_template_id);
      })
    }
  }

  handleVariableClick(variable:any){
    var ref;
    if(this.focusedElement == 'top_header'){
      ref = this.top_header;
    }else if(this.focusedElement == 'bottom_header'){
      ref = this.bottom_header;
    }else if(this.focusedElement == 'footer'){
      ref = this.footer;
    }
    if(ref){
      try{
        ref?.editorService?.insertHtml(variable)
        ref?.focus();
      } catch(error:any) {
        console.error(error?.message);
      }
    }else{
      console.error('No Editor Selected');
    }
  }

  handleHeaderClick(){
    if(this.top_header?.editorToolbar?.htmlMode){
      this.top_header.toggleEditorMode(false);
    }
    if(this.bottom_header?.editorToolbar?.htmlMode){
      this.bottom_header.toggleEditorMode(false);
    }
    if(this.footer?.editorToolbar?.htmlMode){
      this.footer.toggleEditorMode(false);
    }
  }

  onFocus(element: string) {
    this.focusedElement = element;
  }

  handleBodyTemplateSelect(event){
    if(typeof event == 'number'){
      this.htmlContent.body_content = this.marksheet_body_templates.find(ele => ele.id == event).html;
    } else {
      this.htmlContent.body_content = event?.html
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.templateForm = this._fb.group({
        template_name: ['',[Validators.required]],
        certificate_template_id : [null,[Validators.required]],
        top_header: [''],
        bottom_header : [''],
        footer : [''],
        template_type:[0]
      })
    }
	
  //#endregion Private methods
}
