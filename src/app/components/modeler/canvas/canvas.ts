import Canvas from 'diagram-js/lib/core/Canvas.js';
const isNumber = require('min-dash').isNumber;
const assign = require('min-dash').assign;
const debounce = require('min-dash').debounce;
const bind = require('min-dash').bind;

var svgAppend = require('tiny-svg').append,
    svgAttr = require('tiny-svg').attr,
    svgClasses = require('tiny-svg').classes,
    svgCreate = require('tiny-svg').create;

export class CustomCanvas extends Canvas {
  _eventBus;
  _graphicsFactory;
  _elementRegistry;
  _viewport;

  constructor(config, eventBus, graphicsFactory, elementRegistry) {

    super(config, eventBus, graphicsFactory, elementRegistry);

    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
    this._graphicsFactory = graphicsFactory;
    super._viewport = this._viewport;
  }

  ensurePx(number) {
    return isNumber(number) ? number + 'px' : number;
  }

  createContainer(options) {
    // console.log("dimensions: ", document.getElementsByClassName("tab-key")[0].clientWidth);
    /**get width and height from parent container */
    let width =  document.getElementById("modeler-container").clientWidth;
    let heigth =  document.getElementById("modeler-container").clientHeight;
    console.log("[canvas] - modeler container: width", width);
    console.log("[canvas] - modeler container: height", heigth);
    //
    options = assign({}, { width: width, height: heigth }, options);

    const container = options.container || document.body;

    // create a <div> around the svg element with the respective size
    // this way we can always get the correct container size
    // (this is impossible for <svg> elements at the moment)
    const parent = document.createElement('div');
    parent.setAttribute('class', 'djs-container');

    // assign(parent.style, {
    //   position: 'relative',
    //   width: '100%',
    //   height: '100%',
    //   overflow: 'scroll' 
    // });
    assign(parent.style, {
      position: 'relative',
      width: this.ensurePx(width) ,
      height: this.ensurePx(heigth),
      border: '1px solid gray'
      // overflow: 'scroll' 
      // padding:'0px 100% 100% 100%', 
    });

    container.appendChild(parent);

    return parent;
  }

  createGroup(parent, cls, childIndex) {
    const group = svgCreate('g');
    svgClasses(group).add(cls);

    const index = childIndex !== undefined ? childIndex : parent.childNodes.length - 1;

    parent.insertBefore(group, parent.childNodes[index]);

    return group;
  }

  _init(config) {
    const eventBus = this._eventBus;

    // Creates a <svg> element that is wrapped into a <div>.
    // This way we are always able to correctly figure out the size of the svg element
    // by querying the parent node.
    //
    // (It is not possible to get the size of a svg element cross browser @ 2014-04-01)
    //
    // <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
    //   <svg width="100%" height="100%">
    //    ...
    //   </svg>
    // </div>

    // html container
    const container = super._container = this.createContainer(config);

    const svg = super._svg = svgCreate('svg');
    svgAttr(svg, { width: '100%', height: '100%'});
    // assign(svg.style, {
    //   position: 'absolute',
    //   left: '0',
    //   top:'0',
    //   overflow: 'visible'
    // });
    svgAppend(container, svg);
    

    const index = undefined;
    const viewport = this._viewport = this.createGroup(svg, 'viewport', index );

    super._layers = {};

    // debounce canvas.viewbox.changed events
    // for smoother diagram interaction
    if (config.deferUpdate !== false) {
      super._viewboxChanged = debounce(bind(super._viewboxChanged, this), 300);
    }

    eventBus.on('diagram.init', function() {

      /**
       * An event indicating that the canvas is ready to be drawn on.
       *
       * @memberOf Canvas
       *
       * @event canvas.init
       *
       * @type {Object}
       * @property {SVGElement} svg the created svg element
       * @property {SVGElement} viewport the direct parent of diagram elements and shapes
       */
      eventBus.fire('canvas.init', {
        svg: svg,
        viewport: viewport
      });

    }, this);

    // reset viewbox on shape changes to
    // recompute the viewbox
    eventBus.on([
      'shape.added',
      'connection.added',
      'shape.removed',
      'connection.removed',
      'elements.changed'
    ], function() {
      delete this._cachedViewbox;
    }, this);

    eventBus.on('diagram.destroy', 500, super._destroy, this);
    eventBus.on('diagram.clear', 500, super._clear, this);
  }

  /**
 * Gets or sets the scroll of the canvas.
 *
 * @param {Object} [delta] the new scroll to apply.
 *
 * @param {number} [delta.dx]
 * @param {number} [delta.dy]
 */
scroll(delta) {
  var node = this._viewport;
  var matrix = node.getCTM();

  if (delta) {
    console.log("[canvas] - scroll: ", delta);
    let self = this;
    super._changeViewbox(function() {
      delta = assign({ dx: 0, dy: 0 }, delta || {});

      matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);

      self.setCTM(node, matrix);
    });
    //let svg = super._svg;
    // svgAttr(svg, {viewbox: '0 0 1000 1000'});
    // svg.setAttribute("viewBox", `${svg.getBBox().x} ${svg.getBBox().y} ${svg.getBBox().width} ${svg.getBBox().height}`);
  }

  return { x: matrix.e, y: matrix.f };
}

setCTM(node, m) {
  var mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')';
  node.setAttribute('transform', mstr);
}

}