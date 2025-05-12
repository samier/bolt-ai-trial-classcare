import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
// import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';
import { ChatService } from '../chat.service';
import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-chat-layout',
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.scss']
})
export class ChatLayoutComponent implements OnInit {
   @ViewChild('ChatBody') ChatBody: ElementRef = new ElementRef(null);

  constructor(
    public chatService: ChatService,
    public SharedUserService: SharedUserService,
    private toastr: Toastr,
  ) {}

  search = '';
  userList:any = [];
  selectedUserId = null;
  selectedUser:any = null
  message:any = '';
  chats:any = [];
  classes = '';
  chatLoading = false;
  isAdmin = localStorage.getItem('role');
  forwardedMessage = {id: null, message : '', reply_to_id: null};

  params: any = {
    section: null,
    class: null,
    batch: null,
    type: null,
    user: null,
  };

  sections = [{ id: '', name: 'Please Select Section' }];
  classList = [{ id: '', name: 'Please Select Class' }];
  batches = [{ id: '', name: 'Please Select batch' }];
  types:any = [];
  users:any = [];
  timer:any = 0;
  ngOnInit(): void {
    if(this.isAdmin?.includes('ROLE_ADMIN')){
      this.getFilters();
    }
    if(!this.isAdmin?.includes('ROLE_ADMIN')){
      this.getUserList()
    }
    const echo = this.chatService.getEcho();
    
    echo.private('message-'+localStorage.getItem('user_id')).listen('\\App\\Chat\\Events\\SendMessageEvent', (message) => {
      let indexToUpdate = this.userList.findIndex(student => student.id ===  message.data.sender_id);
      if(indexToUpdate !== -1){
        this.userList[indexToUpdate].last_message = message.data.message;
      }
      else{
        this.getUserList();
      }
      if(this.selectedUserId == message.data.sender_id){
        this.pushChat(message.data)
        this.chatService.updateStatus(message.data).subscribe()
        this.scrollToBottom();
      }
      else{
        let userChat = document.querySelector('#user-'+message.data.sender_id);
        userChat?.classList.add('new')
        if(indexToUpdate !== -1){
          this.userList[indexToUpdate].unread = message.unread;
        }
      }

      if (indexToUpdate !== -1) {
        var removedElement = this.userList.splice(indexToUpdate, 1); // Remove the element from its current position
        this.userList.unshift(removedElement[0]); // Add the element to the beginning of the array
      }
    });
    
  }

  ngAfterViewInit(){
    // this.scrollToBottom();
  }

  handleSectionChange() {
    this.params.class = null;
    this.params.batch = null;
    this.params.type = null;
    this.params.user = null;
    this.chatLoading = false;
    this.types = [];
    this.getFilters();
  }

  handleClassChange() {
    this.params.batch = null;
    this.params.exam_type = null;
    this.params.type = null;
    this.params.user = null;
    this.chatLoading = false;
    this.types = [];
    this.getFilters();
  }

  handleBatchChange() {
    this.params.exam_type = null;
    this.params.performance_criteria = null;
    this.params.type = null;
    this.params.user = null;
    this.types = [{ id: 'student', name: 'Student'},{ id: 'user', name: 'User' }];
    this.chatLoading = false;
    this.getFilters();
  }

  getFilters() {
    this.clear();
    this.userList = [];
    this.selectedUser = null;
    this.selectedUserId = null;
    this.chatService.getFilters(this.params).subscribe((resp:any) => {
      this.sections = this.sections.concat(resp.data.sections);
      this.classList = this.classList.concat(resp.data.classes);
      this.batches = this.batches.concat(resp.data.batches);
      this.users = resp.data.users.map((el:any) => {
        return {id: el.id, name: el.full_name}
      })
    })
  }

  getChats(){
    this.chatLoading = false;
    this.chatService.getChats(this.params).subscribe((resp:any) => {
      this.userList = resp.data;
    })
  }

  dynamicClass(user:any){
    let classes = '';
    if(user?.id == this.selectedUserId){
      classes += 'selected '
    }

    if(user?.unread > 0){
      classes += 'new '
    }
    return classes;
  }


  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = this.ChatBody.nativeElement;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 10);

  }

  onSearch = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(async() => {
        this.getUserList();
    }, 500);
};

  getUserList(search? : null){
    this.chatService.getUserList({search: this.search != '' ? this.search : search}).subscribe((resp:any) => {
      if(resp.status){
        this.userList = resp.data;
        this.selectedUserId = null;
        this.selectedUser = null;
        // if(resp.data.length > 0){
        //   this.selectedUserId = resp.data[0].id;
        //   this.selectedUser = resp.data[0];
        //   this.getMessage()
        // }
        this.chatLoading = false;
      }
      
    })
  }

  handleUserClick(user:any){
    this.cancelReply();
    this.chatLoading = false;
    this.selectedUserId = user.id;
    this.selectedUser = user;
    let userChat = document.querySelector('#user-'+user.id);
    userChat?.classList.remove('new')
    this.getMessage()
  }

  sendMessage(){
    let data = {
      sender_id : this.SharedUserService.user.id,
      receiver_id : this.selectedUser.id,
      message: this.message,
      reply: this.forwardedMessage.id,
      reply_to_id: this.forwardedMessage.reply_to_id,
      sender_name: this.SharedUserService.user.full_name,
    };
    
    if(this.message != ''){
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let message = {...data, time:'today', msg_time: formattedTime, reply_id: this.forwardedMessage.id, reply_to_id: this.forwardedMessage.reply_to_id, reply_message: this.forwardedMessage.message}
      this.pushChat(message)

      let indexToUpdate = this.userList.findIndex(student => student.id === this.selectedUser.id,);
      if (indexToUpdate !== -1) {
        this.userList[indexToUpdate].last_message = this.message;
        var removedElement = this.userList.splice(indexToUpdate, 1); // Remove the element from its current position
        this.userList.unshift(removedElement[0]); // Add the element to the beginning of the array
      }
      this.scrollToBottom();
      this.message = ''
      this.cancelReply();
      this.chatService.sendMessage(data).subscribe((resp:any) => {
        this.getMessage()
      })
    }
  }

  pushChat(data:any){
    if(this.chats.length > 0){
      if(this.chats[this.chats.length - 1].some((message:any) => message.time === "today")){
        this.chats[this.chats.length - 1].push(data);
      }else{
        this.chats.push([data]);
      }
      
    }else{
      this.chats.push([data]);
    }
  }

  getMessage(){
    let data = {
      sender_id : this.isAdmin?.includes('ROLE_ADMIN') ? this.params.user :this.SharedUserService.user.id,
      receiver_id : this.selectedUser.id,
    };
    this.chatService.getMessage(data).subscribe((resp:any) => {
      this.chats = resp.data;
      this.chatLoading = true;
      this.scrollToBottom();
    }) 
  }

  deleteChat(){
    let data = {
      sender_id : this.SharedUserService.user.id,
      receiver_id : this.selectedUser.id,
    };

    let confirm = window.confirm('Are you sure you want to delete this chat?');
    if(confirm){
      this.chatService.deleteChat(data).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.getUserList();
          this.getMessage();
        }
        else{
          this.toastr.showInfo(resp.message,'INFO')
        }
      })
    }
  }

  delete(message:any){
    let confirm = window.confirm('Are you sure you want to delete message ?')
    if(confirm){
      this.chatService.deleteSingleChat(message).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess('message deleted.')
          this.getMessage()
        }
      })
    }
  }

  reply(message:any){
    this.forwardedMessage.id = message.id
    this.forwardedMessage.message = message.message
    this.forwardedMessage.reply_to_id = message.sender_id
  }

  cancelReply(){ 
    this.forwardedMessage = {id: null, message : '', reply_to_id: null};
  }

  cancelSearch(){
    this.search = ''
    this.getUserList()
  }

  clear() {
    this.sections = [{ id: '', name: 'All' }];
    this.classList = [];
    this.batches = [];
  }
}
