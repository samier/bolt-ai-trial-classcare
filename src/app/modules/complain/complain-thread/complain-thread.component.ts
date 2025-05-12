import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { ComplainService } from '../complain.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import moment from 'moment';
@Component({
  selector: 'app-complain-thread',
  templateUrl: './complain-thread.component.html',
  styleUrls: ['./complain-thread.component.scss']
})
export class ComplainThreadComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  $destroy: Subject<void> = new Subject<void>();
  groupedComments: any[] = [];
  commentText: any = ''
  // complain : any
  threadMessage: any = []
  thread_loading: boolean = false
  send_loading: boolean = false
  userID : any = window.localStorage.getItem('user_id')

  @Input() complainID: any

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    // private modalRef: NgbActiveModal,
    private toaster: Toastr,
    private ComplainService: ComplainService,
    public dateFormateService: DateFormatService
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.fetchThreadComment();
  }

  // Ensure scroll when view is updated
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  commentApi() {

    if (!this.isCommentValid()) {
      return;
    }

    this.send_loading = true
    const payload = {
      comment: this.commentText
    }
    this.ComplainService.addThreadMessage(payload, this.complainID).subscribe((res: any) => {
      if (res.status) {
        this.send_loading = false
        this.commentText = ''
        this.fetchThreadComment()
      }
    },
      (error: any) => {
        this.send_loading = false;
      });
  }
  isCommentValid(): boolean {
    return this.commentText && this.commentText?.trim()?.length > 0;
  }

  onEnter(event: Event) {
    if (event instanceof KeyboardEvent && this.isCommentValid()) {
      event.preventDefault();
      this.commentApi();
    }
  }

  fetchThreadComment() {
    this.thread_loading = true
    this.ComplainService?.threadList(this.complainID).subscribe((res: any) => {
      if (res.status) {
        this.threadMessage = res.data
        setTimeout(() => this.groupCommentsByDate(), 100);
        this.scrollToBottom();
        this.thread_loading = false;
      } else {
        this.thread_loading = false;
        this.toaster.showError(res.message);
      }
    },
      (error: any) => {
        this.thread_loading = false;
        this.toaster.showError(error?.error?.error || error?.message || error?.error?.message);
      });
  }


  groupCommentsByDate() {
    // const grouped: any = {};
    const grouped: { [key: string]: any[] } = {};

    this.threadMessage.forEach(comment => {
      const commentDate = new Date(comment.created_at).toLocaleDateString(); // Convert to readable date string
      const today = moment();
      let formattedDate: string;

      const messageDate = moment(commentDate, "MM/DD/YYYY");
      if (messageDate.isSame(today, 'day')) {
        formattedDate = 'Today';
      } else if (messageDate.isSame(today.subtract(1, 'day'), 'day')) {
        formattedDate = 'Yesterday';
      } else {
        formattedDate = commentDate
      }

      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }
      grouped[formattedDate].push(comment);
    });

    // Convert grouped object into an array
    this.groupedComments = Object.keys(grouped).map(date => ({
      date,
      comments: grouped[date],
    }));

    // Convert grouped object into an array
    this.groupedComments = Object.keys(grouped).map(date => ({
      date,
      comments: grouped[date]
    }));
  }
  // Scroll to the bottom
  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer?.nativeElement?.scrollHeight;
    } catch (err: any) {

    }
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}