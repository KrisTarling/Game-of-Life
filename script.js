var Board = React.createClass({
  displayName: "Board",
  
  // generate starting board
  getInitialState: function getInitialState() {
    var c = [];
    var cG = [];
    for (var i = 0, x = 5, y = 5; i < 900; i++, x += 35) {
      if (x > 1045) y += 35, x = 5;
      var o = Math.round(Math.random());
      cG.push(o);
      c.push(React.createElement(Cell, { xp: x, yp: y, key: i, o: o, handleClick: this.handleClick.bind(this, i) }));
    }

    return {
      genCount: 0, // number of generations
      cells: c, // cell data
      cG: cG, // current cell generation
      nG: [], // next cell generation
      play: 1 // play-pause
    };
  },
  
  // generate new cells
  createCells: function(x, y, i, o, handleClick) {
      this.state.nG.splice(i, 1, o);
      this.state.cells.splice(i, 1, React.createElement(Cell, { xp: x, yp: y, key: i, o: o, handleClick: handleClick }));
    
    },
  
  // rendering complete
  componentDidMount: function componentDidMount() {
    this.timer = setInterval(this.tick, 500);
  },

  // cell logic
  tick: function tick() {
    this.setState({ genCount: this.state.genCount + 1 }); // count a generation
    var cG = this.state.cG;
    var nG = [];
    
    var nG = cG.map(function(v,i,a) { // count living neighbours
      let n = 0;
      if (a[i + 1]) n++;
      if (a[i + 29]) n++;
      if (a[i + 30]) n++;
      if (a[i + 31]) n++;
      if (a[i - 1]) n++;
      if (a[i - 29]) n++;
      if (a[i - 30]) n++;
      if (a[i - 31]) n++;
      if (n < 2 || n > 3) return 0 // return if cell should live/die
      if (n == 3 || v == 1) return 1 
      return 0
    })
    
    // kill/create cells
    for (var i = 0, x = 5, y = 5; i < 900; i++, x += 35) {
      if (x > 1045) y += 35, x = 5; // new row
      if (cG[i] === nG[i]) continue // if cell is the same, continue to next cell
      this.createCells(x, y, i, nG[i], this.handleClick);
    }

    // on to next generation
    this.setState({ cG: nG });
  },
  
  
  // cell click function
  handleClick: function handleClick(_, i) {
    var cG = this.state.cG;
    var c = this.state.cells;
    var t = i.substring(8);
    var v = c[t].props.o ^ 1
    
    // render changed cell
    this.createCells(c[t].props.xp, c[t].props.yp, t, v, this.handleClick);
    cG.splice(t, 1, v);
    this.setState({cG:cG})
  },
  
   // random button
    random: function random() {
    var rG = []
    for (var i = 0; i < 900; i++) {
      rG.push(Math.round(Math.random()))
    }
    this.setState({cG: rG, play: 1, genCount:0})
    clearInterval(this.timer)
    this.timer = setInterval(this.tick, 500);
    document.getElementById("pause").innerHTML = "<i class='fa fa-pause'></i> pause";
  },
  
  // pause button
  pause: function pause() {
    if (this.state.play) {
      clearInterval(this.timer), this.setState({play: 0}), document.getElementById("pause").innerHTML = "<i class='fa fa-play'></i> play";
    } else {
      this.timer = setInterval(this.tick, 500)
      this.setState({play: 1})
      document.getElementById("pause").innerHTML = "<i class='fa fa-pause'></i> pause";
    }
  },
  
  // clear button
  clear: function clear() {
    clearInterval(this.timer)
    document.getElementById("pause").innerHTML = "<i class='fa fa-play'></i> play";
    var c = []
    
    for (var i = 0, x = 5, y = 5; i < Math.pow(this.props.bSize, 2); i++, x += 35) {
      if (x > 35 * this.props.bSize - 5) y += 35, x = 5;
      this.state.cells.splice(i, 1, React.createElement(Cell, { xp: x, yp: y, key: i, o: 0, handleClick: this.handleClick }));
      c.push(0)
    }
    
    this.setState({ cG: c, nG: c, genCount: 0, play: 0 });
    
  },
  
  // render board
  render: function() {
    return (
      <div id="svgwrap">
        <svg id="svg" height={this.props.size} width={this.props.size} version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g fill="transparent" strokeWidth="2" >
          {this.state.cells}
          </g>
        </svg>
        <GenCount genCount={this.state.genCount} />
        <Ctrl onPause={this.pause} onClear={this.clear} onRandom={this.random} />
      </div>
    )
  }
});


// individual cells //
var Cell = React.createClass({
  displayName: "Cell",
  render: function render() {
    var s = "#101e1d";
    if (this.props.o) s = "#7BD6CF";
    return React.createElement("rect", { x: this.props.xp, y: this.props.yp, width: "25", height: "25", stroke: s, key: this.props.key, onClick: this.props.handleClick });
  }
});


// generation counter //
var GenCount = React.createClass({
  displayName: "GenCount",
  render: function render() {
    return React.createElement(
      "div",
      { id: "gen" },
      "generation: ",
      this.props.genCount
    );
  }
});


// control buttons //
var Ctrl = React.createClass({
  displayName: "Ctrl",
  render() {
    return React.createElement(
      "div",
      { id: "ctrl" },
      React.createElement(
        "a",
        { onClick: this.props.onClear },
        React.createElement("i", { className: "fa fa-pencil-square-o"}," clear" ),
      ),
      React.createElement(
        "a",
        { onClick: this.props.onRandom },
        React.createElement("i", { className: "fa fa-random"}," randomize" ),
      ),
      React.createElement(
        "a",
        { onClick: this.props.onPause, id: "pause" },
        React.createElement("i", { className: "fa fa-pause"}," pause" )
      ),
    );
  }
});

var App = React.createClass({
  displayName: "App",
  render: function render() {
    return React.createElement(Board, { size: "910", bSize: "30" });
  }
});ReactDOM.render(React.createElement(App, null), svg);