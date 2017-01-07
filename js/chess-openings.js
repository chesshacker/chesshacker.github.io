---
---
var HOST = 'https://chess-demo.ortizaggies.com';

var FILES = 'abcdefgh';
var RANKS = '87654321';

var gameModel = {
    initialize: function(fens,sans) {
        this.observers = new Array();
        this.isFlipped = false;
        this.load(fens,sans);
        return this;
    },
    // observers must implement observe(event, context)
    addObserver: function(observer) {
        this.observers.push(observer);
    },
    notifyObservers: function(event, context) {
        this.observers.forEach(function(aObserver) {
            aObserver.observe(event, context);
        });
    },
    // methods that update the game model should call notifyObservers()
    load: function(fens,sans) {
        this.ply = sans.length;
        this.fenArray = fens;
        this.sanArray = sans;
        this.undoPly = 0;
        this.notifyObservers("load",null);
    },
    truncateFromUndo: function() {
      var undo = this.undoPly;
      if (undo > 0) {
        this.ply -= undo;
        this.undoPly = 0;
        this.fenArray = this.fenArray.slice(0,this.ply+1);
        this.sanArray = this.sanArray.slice(0,this.ply);
        this.notifyObservers("truncateFromUndo", undo);
      }
    },
    addMove: function(fen, san) {
        // first clear the undo ply
        this.truncateFromUndo();
        // then add the move
        this.ply++;
        this.fenArray.push(fen);
        this.sanArray.push(san);
        // add notify observers
        this.notifyObservers("addMove", {fen:fen, san:san});
    },
    flipBoard: function() {
        this.isFlipped = !this.isFlipped;
        this.notifyObservers("flipBoard",null);
    },
    adjustUndoPly: function(value) { // number of ply (+) forward or (-) backward
        this.selectPly( this.currentPly() + value );
    },
    newGame: function() {
        this.selectPly(0);
        this.truncateFromUndo();
    },
    selectPly: function(plySelected) {
        plySelected = Math.min(this.ply,Math.max(0,plySelected));
        var currentPly = this.currentPly();
        if (plySelected != currentPly) {
            this.undoPly = this.ply - plySelected;
            this.notifyObservers("changedPly",currentPly);
        }
    },
    fen: function() {
        return this.fenArray[this.ply-this.undoPly];
    },
    currentPly: function() {
        return this.ply - this.undoPly;
    },
    moves: function() {
        return this.sanArray.slice(0,this.currentPly()).join(' ');
    }
};

var boardView = {
    initialize: function($div, game) {
        this.$div = $div;
        this.game = game;
        this.game.addObserver(this);
        this.updateSquareSize();
        $(window).resize(this, function(event) {
            event.data.resize();
        });
        return this;
    },
    observe: function(event, context) {
        // respond to changes in game
        switch (event) {
        case "load":
        case "truncateFromUndo":
        case "addMove":
        case "changedPly":
            this.drawPosition();
            break;
        case "flipBoard":
            this.draw();
            break;
        default:
            alert("BoardView received an unknown event: " + event);
        }
    },
    updateSquareSize: function() {
        var div_width = this.$div.width();
        this.last_width = div_width;
        this.square_size = div_width / 8.5;
        this.label_size = Math.floor(this.square_size / 2);
        this.label_font_size = Math.floor(this.square_size / 3);
        this.square_size = this.label_size * 2;
        this.$div.height(this.square_size * 8.5);
    },
    resize: function() {
        if (this.$div.width() != this.last_width) {
            this.updateSquareSize();
            this.draw();
        }
    },
    setTopLeftSquare: function($element,file,rank) {
        // file 0 - 7 => a - h
        // rank 0 - 7 => 8 - 1
        $element.css({
            left: this.label_size + this.square_size * (this.game.isFlipped?7-file:file) + 'px',
            top: this.square_size * (this.game.isFlipped?7-rank:rank) + 'px',
            position: 'absolute'
        });
    },
    drawSquares: function() {
        var $square,$label,r,f,sqName;
        this.$div.empty();
        for (f=0; f<8; f++) {
            for (r=0; r<8; r++) {
                sqName = FILES[f]+RANKS[r];
                $square = $('<div/>',{
                    id:sqName,
                    "class":(r+f)%2?'darkSquare':'lightSquare',
                    width: this.square_size + 'px',
                    height: this.square_size + 'px',
                });
                this.setTopLeftSquare($square, f, r);
                $square.droppable({
                    drop: controller.movePiece,
                });
                this.$div.append($square);
            }
        }
        for (f=0; f<8; f++) {
            $label = $('<div/>',{
                'class':'fileLabel',
                width: this.square_size + 'px',
                height: this.label_size + 'px',
            });
            $label.css({
                'line-height': this.label_size + 'px',
                'font-size': this.label_font_size + 'px',
                top: (this.square_size * 8) + 'px',
                left: this.label_size + this.square_size * (this.game.isFlipped?7-f:f) + 'px'
            });
            $label.html(FILES[f]);
            this.$div.append($label);
        }
        for (r=0; r<8; r++) {
            $label = $('<div/>',{
                'class':'rankLabel',
                width: this.label_size + 'px',
                height: this.square_size + 'px'
            });
            $label.css({
                'line-height': this.square_size + 'px',
                'font-size': this.label_font_size + 'px',
                top: this.square_size * (this.game.isFlipped?7-r:r) + 'px'
            });
            $label.html(RANKS[r]);
            this.$div.append($label);
        }
    },
    drawPosition: function() {
        var i,j,r,f,isWhiteToMove,c,imgName,pieceName,$piece,makeDraggable;
        var fen = this.game.fen();
        this.$div.children().filter('img').remove(); // clear existing pieces
        r = f = 0;
        j = fen.indexOf(' ');
        isWhiteToMove = fen.charAt(j+1)=='w';
        for (i=0; i<j; i++) {
            c = fen.charAt(i);
            if (c=='/') { // next rank
                r++; f=0;
            } else if ('12345678'.indexOf(c) != -1) { // skip c squares
                f += c*1; // converts c char to int
            } else {
                if ('rnbqkp'.indexOf(c) != -1) { // black piece
                    imgName = 'b' + c;
                    makeDraggable = isWhiteToMove ? false : true;
                } else if  ('RNBQKP'.indexOf(c) != -1) { // white piece
                    imgName = 'w' + c.toLowerCase();
                    makeDraggable = isWhiteToMove ? true : false;
                } else {
                    alert('error parsing fen');
                }
                pieceName = c.toUpperCase() + FILES[f] + RANKS[r];
                $piece = $('<img/>',{
                    'class':(makeDraggable?'piece draggable':'piece'),
                    src: HOST + '/assets/' + imgName + '.gif', width: this.square_size, height: this.square_size,
                    id:pieceName
                });
                if (makeDraggable)
                    $piece.draggable({revert:'invalid'});
                this.setTopLeftSquare($piece,f,r);
                this.$div.append($piece);
                f++;
            }
        }
    },
    draw: function() {
        // draw is done in two parts... If the pieces are the only thing being updated,
        // drawPosition is all that's needed.  If the board is flipped, call draw to redraw
        // the squares (labels too) and position.
        this.drawSquares();
        this.drawPosition();
    }
};

var moveListView = {
    initialize: function($div, game) {
        this.game = game;
        this.game.addObserver(this);
        this.$div = $div;
        return this;
    },
    observe: function(event, context) {
        // respond to changes in game
        switch (event) {
        case "load":
        case "truncateFromUndo":
        case "addMove":
        case "changedPly":
        case "flipBoard":
            this.draw();
            break;
        default:
            alert("MoveListView received an unknown event: " + event);
        }
    },
    draw: function() {
        var i;
        var moves = "";
        var currentPly = this.game.currentPly();
        var isLastMove = false;
        for (i=0; i<this.game.ply; i++) {
            isLastMove = i==currentPly-1
            moves += (i%2==0? ' ' + (i/2 + 1) + '. ': ' ');
            if (isLastMove) { moves += '<span class="lastMove">'; }
            moves += '<a href="#" onclick="controller.selectPly(' + (i+1) + '); return false;">' + this.game.sanArray[i] + '</a>';
            if (isLastMove) { moves += '</span>'; }
        }
        this.$div.html(moves);
    }
};

var statisticsView = {
    initialize: function($div, game) {
        this.game = game;
        this.game.addObserver(this);
        this.$div = $div;
        this.busy = false;
        this.fen = null;
        return this;
    },
    observe: function(event, context) {
        // respond to changes in game
        switch (event) {
        case "load":
        case "addMove":
        case "changedPly":
            this.draw();
            break;
        case "truncateFromUndo":
        case "flipBoard":
            break;
        default:
            alert("StatisticsView received an unknown event: " + event);
        }
    },
    draw: function() {
        if  (!this.isCurrent()) {
            if (this.lock()) {
                this.fen = this.game.fen();
                this.$div.empty();
                $.ajax({
                    url: HOST + '/browser/statistics',
                    data: {fen: this.fen},
                    context: this,
                    success: function(response) {
                        this.$div.html(response);
                        controller.stats.unlock();
                    }
                });
            }
        }
    },
    isCurrent: function() {
        var fen = this.game.fen();
        return this.fen == fen
    },
    lock: function() {
        if (this.busy) { return false; }
        this.busy = true;
        return true;
    },
    unlock: function() {
        this.busy = false;
    }
};

var controller = {
    initialize: function(game, board, moveList, stats, $flash) {
        this.game = game;
        this.board = board;
        this.moveList = moveList;
        this.stats = stats;
        this.board.draw();
        this.moveList.draw();
        this.stats.draw();
        this.registerKeyboardEvents();
        this.$flash = $flash
        return this;
    },
    setFlash: function(value) {
        this.$flash.html(value);
    },
    clearFlash: function() {
        this.$flash.empty();
    },
    registerKeyboardEvents: function() {
        // register for keyboard events
        $(document).keydown(function(event) {
            var undoPly = 0; // moves to change the undoPly by (+ => forward)
            switch (event.keyCode) {
            case 37: // left
                undoPly = -1;
                break;
            case 39: // right
                undoPly = 1;
                break;
            case 38: // up
                undoPly = -2;
                break;
            case 40: // down
                undoPly = 2;
                break;
            }
            if (undoPly != 0) {
                controller.game.adjustUndoPly(undoPly);
                return false;
            }
        });
    }
};
var t1;
controller.movePiece = function(event, ui) {
    var $targetSquare = $(event.target);
    var targetSquareName = $targetSquare.attr('id');
    var $piece = $(ui.draggable);
    var pieceName = $piece.attr('id');
    // snap to square
    $piece.css({
       left: $targetSquare.css('left'),
       top: $targetSquare.css('top')
    });
    // check that it wasn't dropped on its current square
    if (pieceName.indexOf(targetSquareName)==-1) {
        var move = pieceName + targetSquareName
        // check for pawn promotion
        if (move.charAt(0)=='P' && (move.charAt(4)=='8' || move.charAt(4)=='1'))
            move += '=Q'; // TODO: add option to promote to rook, bishop or knight
        controller.sendMove(move);
    }
}
controller.sendMove = function(moveString) {
    var moves = controller.game.moves();
    $.ajax({
        url: HOST + '/browser/make_move',
        async: false,
        data: {move:moveString, graph:moves}
    });
}
controller.newGame = function() {
    controller.game.newGame();
    controller.clearFlash();
}
controller.flipBoard = function() {
    controller.game.flipBoard();
    controller.clearFlash();
}
controller.selectPly = function(ply) {
    controller.game.selectPly(ply);
    controller.clearFlash();
}
