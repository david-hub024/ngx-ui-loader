import { Component, Input, OnInit, OnChanges, SimpleChanges, SimpleChange, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from './ngx-ui-loader.service';
import { Observable, Subscription } from 'rxjs';
import { NgxUiLoaderConfig } from './ngx-ui-loader-config';
import { DirectionType, PositionType, SpinnerType } from './ngx-ui-loader.types';
import { POSITION, PB_DIRECTION, SPINNER } from './ngx-ui-loader.enums';
import { SPINNER_CONFIG } from './ngx-ui-loader.contants';
import { coerceNumber } from './coercion';

@Component({
  selector: 'ngx-ui-loader',
  templateUrl: './ngx-ui-loader.component.html',
  styleUrls: ['./ngx-ui-loader.component.scss']
})
export class NgxUiLoaderComponent implements OnChanges, OnDestroy, OnInit {

  @Input() bgsColor: string;
  @Input() bgsOpacity: number;
  @Input() bgsPosition: PositionType;
  @Input() bgsSize: number;
  @Input() bgsType: SpinnerType;
  @Input() fgsColor: string;
  @Input() fgsPosition: PositionType;
  @Input() fgsSize: number;
  @Input() fgsType: SpinnerType;
  @Input() gap: number;
  @Input() logoPosition: PositionType;
  @Input() logoSize: number;
  @Input() logoUrl: string;
  @Input() overlayColor: string;
  @Input() pbColor: string;
  @Input() pbDirection: DirectionType;
  @Input() pbThickness: number;
  @Input() text: string;
  @Input() textColor: string;
  @Input() textPosition: PositionType;

  fgDivs: number[];
  fgSpinnerClass: string;
  bgDivs: number[];
  bgSpinnerClass: string;
  showForeground: boolean;
  showBackground: boolean;
  foregroundClosing: boolean;
  backgroundClosing: boolean;

  trustedLogoUrl: any;
  logoTop: any;
  spinnerTop: any;
  textTop: any;

  showForegroundWatcher: Subscription;
  showBackgroundWatcher: Subscription;
  foregroundClosingWatcher: Subscription;
  backgroundClosingWatcher: Subscription;

  defaultConfig: NgxUiLoaderConfig;
  private initialized: boolean;

  /**
   * Constructor
   * @param domSanitizer
   * @param ngxService
   */
  constructor(
    private domSanitizer: DomSanitizer,
    private ngxService: NgxUiLoaderService) {

    this.initialized = false;
    this.defaultConfig = this.ngxService.getDefaultConfig();

    this.bgsColor = this.defaultConfig.bgsColor;
    this.bgsOpacity = this.defaultConfig.bgsOpacity;
    this.bgsPosition = this.defaultConfig.bgsPosition;
    this.bgsSize = this.defaultConfig.bgsSize;
    this.bgsType = this.defaultConfig.bgsType;
    this.fgsColor = this.defaultConfig.fgsColor;
    this.fgsPosition = this.defaultConfig.fgsPosition;
    this.fgsSize = this.defaultConfig.fgsSize;
    this.fgsType = this.defaultConfig.fgsType;
    this.gap = this.defaultConfig.gap;
    this.logoPosition = this.defaultConfig.logoPosition;
    this.logoSize = this.defaultConfig.logoSize;
    this.logoUrl = this.defaultConfig.logoUrl;
    this.overlayColor = this.defaultConfig.overlayColor;
    this.pbColor = this.defaultConfig.pbColor;
    this.pbDirection = this.defaultConfig.pbDirection;
    this.pbThickness = this.defaultConfig.pbThickness;
    this.text = this.defaultConfig.text;
    this.textColor = this.defaultConfig.textColor;
    this.textPosition = this.defaultConfig.textPosition;
  }

  /**
   * On init event
   */
  ngOnInit() {
    this.initializeSpinners();
    this.determinePositions();

    this.bgsPosition = <PositionType>this.validate('bgsPosition', this.bgsPosition, POSITION, this.defaultConfig.bgsPosition);

    this.trustedLogoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.logoUrl);

    this.pbDirection = <DirectionType>this.validate('pbDirection', this.pbDirection, PB_DIRECTION, this.defaultConfig.pbDirection);

    this.showForegroundWatcher = this.ngxService.showForeground
      .subscribe(data => this.showForeground = data);

    this.showBackgroundWatcher = this.ngxService.showBackground
      .subscribe(data => this.showBackground = data);

    this.foregroundClosingWatcher = this.ngxService.foregroundClosing
      .subscribe(data => this.foregroundClosing = data);

    this.backgroundClosingWatcher = this.ngxService.backgroundClosing
      .subscribe(data => this.backgroundClosing = data);
    this.initialized = true;
  }

  /**
   * On changes event
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (!this.initialized) {
      return;
    }

    const bgsTypeChange: SimpleChange = changes.bgsType;
    const bgsPositionChange: SimpleChange = changes.bgsPosition;
    const fgsTypeChange: SimpleChange = changes.fgsType;
    const logoUrlChange: SimpleChange = changes.logoUrl;
    const pbDirectionChange: SimpleChange = changes.pbDirection;

    if (fgsTypeChange || bgsTypeChange) {
      this.initializeSpinners();
    }

    this.determinePositions();

    if (bgsPositionChange) {
      this.bgsPosition = <PositionType>this.validate('bgsPosition', this.bgsPosition, POSITION, this.defaultConfig.bgsPosition);
    }

    if (logoUrlChange) {
      this.trustedLogoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.logoUrl);
    }

    if (pbDirectionChange) {
      this.pbDirection = <DirectionType>this.validate('pbDirection', this.pbDirection, PB_DIRECTION, this.defaultConfig.pbDirection);
    }
  }

  /**
   * Initialize spinners
   */
  private initializeSpinners() {
    this.fgsType = <SpinnerType>this.validate('fgsType', this.fgsType, SPINNER, this.defaultConfig.fgsType);
    this.bgsType = <SpinnerType>this.validate('bgsType', this.bgsType, SPINNER, this.defaultConfig.bgsType);

    this.fgDivs = Array(SPINNER_CONFIG[this.fgsType].divs).fill(1);
    this.fgSpinnerClass = SPINNER_CONFIG[this.fgsType].class;
    this.bgDivs = Array(SPINNER_CONFIG[this.bgsType].divs).fill(1);
    this.bgSpinnerClass = SPINNER_CONFIG[this.bgsType].class;
  }

  /**
   * Determine the positions of spinner, logo and text
   */
  private determinePositions() {
    this.fgsPosition = <PositionType>this.validate('fgsPosition', this.fgsPosition, POSITION, this.defaultConfig.fgsPosition);
    this.logoPosition = <PositionType>this.validate('logoPosition', this.logoPosition, POSITION, this.defaultConfig.logoPosition);
    this.textPosition = <PositionType>this.validate('textPosition', this.textPosition, POSITION, this.defaultConfig.textPosition);
    this.gap = coerceNumber(this.gap, this.defaultConfig.gap);

    this.logoTop = 'initial';
    this.spinnerTop = 'initial';
    this.textTop = 'initial';
    const textSize = 24;

    if (this.logoPosition.startsWith('center')) {
      this.logoTop = '50%';
    } else if (this.logoPosition.startsWith('top')) {
      this.logoTop = '30px';
    }

    if (this.fgsPosition.startsWith('center')) {
      this.spinnerTop = '50%';
    } else if (this.fgsPosition.startsWith('top')) {
      this.spinnerTop = '30px';
    }

    if (this.textPosition.startsWith('center')) {
      this.textTop = '50%';
    } else if (this.textPosition.startsWith('top')) {
      this.textTop = '30px';
    }

    if (this.fgsPosition === POSITION.centerCenter) {
      if (this.logoUrl && this.logoPosition === POSITION.centerCenter) {
        if (this.text && this.textPosition === POSITION.centerCenter) { // logo, spinner and text
          this.logoTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% - ${this.fgsSize / 2}px - ${textSize / 2}px - ${this.gap}px)`);
          this.spinnerTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% + ${this.logoSize / 2}px - ${textSize / 2}px)`);
          this.textTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% + ${this.logoSize / 2}px + ${this.gap}px + ${this.fgsSize / 2}px)`);
        } else { // logo and spinner
          this.logoTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% - ${this.fgsSize / 2}px - ${this.gap / 2}px)`);
          this.spinnerTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% + ${this.logoSize / 2}px + ${this.gap / 2}px)`);
        }
      } else {
        if (this.text && this.textPosition === POSITION.centerCenter) { // spinner and text
          this.spinnerTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% - ${textSize / 2}px - ${this.gap / 2}px)`);
          this.textTop = this.domSanitizer
            .bypassSecurityTrustStyle(`calc(50% + ${this.fgsSize / 2}px + ${this.gap / 2}px)`);
        }
      }
    } else {
      if (this.logoUrl && this.logoPosition === POSITION.centerCenter
        && this.text && this.textPosition === POSITION.centerCenter) { // logo and text
        this.logoTop = this.domSanitizer
          .bypassSecurityTrustStyle(`calc(50% - ${textSize / 2}px - ${this.gap / 2}px)`);
        this.textTop = this.domSanitizer
          .bypassSecurityTrustStyle(`calc(50% + ${this.logoSize / 2}px + ${this.gap / 2}px)`);
      }
    }
  }

  private validate(inputName: string, value: string, validTypeObj: {}, fallbackValue: string) {
    if (Object.keys(validTypeObj).map(k => validTypeObj[k]).findIndex(v => v === value) === -1) {
      console.error(`[ngx-ui-loader] - ${inputName} ("${value}") is invalid. `
        + `Default value "${fallbackValue}" is used.`);
      return fallbackValue;
    }
    return value;
  }

  /**
   * On destroy event
   */
  ngOnDestroy() {
    if (this.showForegroundWatcher) {
      this.showForegroundWatcher.unsubscribe();
    }
    if (this.showBackgroundWatcher) {
      this.showBackgroundWatcher.unsubscribe();
    }
    if (this.foregroundClosingWatcher) {
      this.foregroundClosingWatcher.unsubscribe();
    }
    if (this.backgroundClosingWatcher) {
      this.backgroundClosingWatcher.unsubscribe();
    }
  }
}
