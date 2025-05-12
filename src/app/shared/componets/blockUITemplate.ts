import { Component } from '@angular/core';

@Component({
  selector: 'block-temp',
  styles: [`
    .loader-div .loader{
        height:15em;
        width:15em;
    }
  `],
  template: `
    <div class="block-ui-template loader-div">    
       <div class="loader"></div>
    </div>
  `
})
export class BlockUITemplateComponent { }
