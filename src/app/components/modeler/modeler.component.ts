import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import gridModuleBpmn from "diagram-js/lib/features/grid-snapping/visuals";

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.css']
})
export class ModelerComponent implements OnInit {
  private bpmnJS: BpmnJS;
  @ViewChild('modelerRef', { static: true }) private el: ElementRef;
  constructor() { }

  ngOnInit(): void {
    this.bpmnJS = new BpmnJS({
      container: this.el.nativeElement,
      width: '100%',
      height: '100%',
      additionalModules: [
        gridModuleBpmn
      ]
    });
    this.bpmnJS.on('import.done', ({error}) => {
      if(!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });

    this.bpmnJS.importXML(this.getInitialXml());
  }

  ngOnDestroy() {
    this.bpmnJS.destroy();
  }

  getInitialXml(){
    var timestamp = new Date().getTime();
    return '<?xml version="1.0" encoding="UTF-8"?><definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="sid-38422fae-e03e-43a3-bef4-'+timestamp+'" targetNamespace="http://bpmn.io/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="7.2.0"><process id="Process_'+timestamp+'"></process><bpmndi:BPMNDiagram id="BpmnDiagram_'+timestamp+'"><bpmndi:BPMNPlane id="BpmnPlane_'+timestamp+'" bpmnElement="Process_'+timestamp+'"></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></definitions>';
  }
}
