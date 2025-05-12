import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import Prism from 'prismjs';


@Component({
  selector: 'app-integration-code',
  templateUrl: './integration-code.component.html',
  styleUrls: ['./integration-code.component.scss'],
})
export class IntegrationCodeComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() inquiryFormId: string | null = null;
  dynamicUrl: string = '';
  isCopy: boolean = false;
  scriptCode: string = '';
  qrCodeDownloadLink: SafeUrl | null = null; // Added type declaration

  @ViewChild('qrcode', { static: false }) qrcode!: QRCodeComponent;

  constructor() {}

  ngOnInit(): void {
    this.updateDynamicUrl();
    this.generateScriptCode();
  }

  ngAfterViewInit(): void {
    Prism.highlightAll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inquiryFormId'] && this.inquiryFormId) {
      this.updateDynamicUrl();
      this.generateScriptCode();
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem('inquiryFormId');
  }

  copyCode(): void {
    this.isCopy = true;
    setTimeout(() => {
      this.isCopy = false;
    }, 1000);
  }

  onChangeURL(url: SafeUrl): void {
    this.qrCodeDownloadLink = url;
  }

  downloadQrCode(): void {
    setTimeout(() => {
      const canvasElement = this.qrcode.qrcElement.nativeElement.querySelector('canvas');
      if (canvasElement) {
        const imageUrl = canvasElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'qrcode.png';
        link.click();
      } else {
        console.error('QR Code element not found');
      }
    }, 500);
  }

  updateDynamicUrl(): void {
    this.dynamicUrl = `${window.location.origin}/app/inquiry-form/${this.inquiryFormId || '1'}`;
  }

  generateScriptCode(): void {
    this.scriptCode = `
      \`\`\`html
      <div id="inquiry-form-content"></div>
      \`\`\`

      \`\`\`javascript
      <script>
        (function() {
          var container = document.getElementById("inquiry-form-content");

          if (container) {
            var iframe = document.createElement("iframe");
            iframe.src = "${this.dynamicUrl}";
            iframe.style.cssText = "width:100%; border:none; display:block; overflow:hidden; transition: height 0.2s ease-in-out;";

            container.appendChild(iframe);

            window.addEventListener("message", function(event) {
              if (event.data && event.data.height) {
                iframe.style.height = event.data.height + "px";
              }
            });
          }
        })();
      </script>
      \`\`\`
          `.trim();
  }
}