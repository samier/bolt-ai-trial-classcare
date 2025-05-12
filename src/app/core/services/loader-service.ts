import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isLoading = false;
  public switcherLoading:any;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  show() {
    this.isLoading = true;
  }

  hide() {
    this.isLoading = false;
  }

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

}