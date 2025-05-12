import { Component, HostListener, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { NavService } from 'src/app/shared/services/nav.service';

@Component({
  selector: 'app-quick-search-modal',
  templateUrl: './quick-search-modal.component.html',
  styleUrls: ['./quick-search-modal.component.scss']
})
export class QuickSearchModalComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  searchTerm = '';
  menuItems: any[] = [];
  filteredMenu: any[] = [];
  selectedIndex = -1;
  filteredItems: HTMLElement[] = [];

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private modalRef: NgbActiveModal,
    private navService: NavService,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.menuItems = this.navService.getMenuItems();
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    this.selectedIndex = -1;
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
   

  highlight(text: string) {
    return this.searchTerm
      ? text.replace(new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi'), '<mark>$1</mark>')
      : text;
  }

  escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  closeModal() {
    this.searchTerm = '';
    this.filteredMenu = [];
    this.selectedIndex = -1;
    this.modalRef.dismiss()
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.searchTerm) return;

    this.filteredItems = Array.from(document.querySelectorAll('.search-link')) as HTMLElement[];

    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();

      if (event.key === 'ArrowDown') {
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredItems.length;
      } else if (event.key === 'ArrowUp') {
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredItems.length) % this.filteredItems.length; 
      }

      setTimeout(() => { 
        this.filteredItems[this.selectedIndex]?.focus();
      }, 0);
    }

    if (event.key === 'Enter' && this.selectedIndex >= 0) {
      event.preventDefault();
      this.filteredItems[this.selectedIndex]?.click(); 
    }
  }
  
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
	
  //#endregion Private methods
}