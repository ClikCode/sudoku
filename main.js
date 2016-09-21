(function (){
    var version = "1.0"
    var grid = []
    var cells = []
    var time = 0;

    function keepOver(num) {
        var points = []
        for (var cell of cells) {
            setClass(cell, "empty")
        }
        for (var i of _.range(9)) {
            for (var j of _.range(9)) {
                points.push([i, j])
            }
        }
        for (var [x,y] of _.shuffle(points).slice(num, points.length)) {
            setValue(getCell(x, y), null)
        }
        for (var cell of cells) {
            if (getValue(cell) != null) {
                setClass(cell, "solid")
            }
        }

    }
    difficulty = {
        very_easy: 50,
        easy: 40,
        normal: 30,
        hard: 20,
        very_hard: 10,
    }
    function generate(num = difficulty.easy) {
        clearAll(true)
        for (var k of _.range(0, 9, 3)) {
            var vals = _.shuffle(_.range(1, 10))
            for (var i of _.range(3)) {
                for (var j of _.range(3)) {
                    _setValue(getCell(k + i, k + j), vals.pop())
                }
            }
        }
        solve()
        keepOver(num)
        time=0
        save(grid)

    }
    function solve() {
        // Prepare
        var empties = []
        for (var empty of $(".empty")) {
            empties.push($(empty))
        }
        var used = [[]]
        var index = 0
        while (index < empties.length) {
            // console.log(used.toString())
            var cell = empties[index]
            _setValue(cell, null)

            var vals = _.difference(
                validNumbers(cell),
                used[index]
            )
            vals
            if (vals.length > 0) {
                var val = vals[0]//_.shuffle(vals)[0]
                _setValue(cell, val)
                setClass(cell,null)
                used[index].push(val)

                index = index + 1
                used.push([])
            }
            else {
                _setValue(cell, null)
                setClass(cell,"empty")
                index = index - 1
                used.pop()

            }
        }
        validateAll()
        index
        save(grid)
    }
    function validNumbers(cell) {
        var vals = _.range(1, 10)
        var [x, y] = cell.data("pos")
        for (var k of _.range(9)) {
            for (var [ox,oy] of [[x, k], [k, y]]) {
                if (!(x == ox & y == oy)) {
                    var oval = getValue(getCell(ox, oy))
                    if (oval != null)
                        vals = _.difference(vals, [oval,])
                }
            }
        }
        var [sx,sy] = [Math.floor(x / 3), Math.floor(y / 3)]
        for (var ox of _.range(sx * 3, sx * 3 + 3)) {
            for (var oy of _.range(sy * 3, sy * 3 + 3)) {
                if (!(x == ox & y == oy)) {
                    var oval = getValue(getCell(ox, oy))
                    if (oval != null)
                        vals = _.difference(vals, [oval,])
                }
            }
        }
        return vals
    }

    function clearAll(solids = false) {
        for (var cell of cells) {
            var cls = getClass(cell)
            if (cls != "solid" | solids) {
                setClass(cell, "empty")
                _setValue(cell, null)
            }
        }
    }


    function validateAll() {
        for (var cell of cells){
            if (getClass(cell)!="solid"){
                setClass(cell,null)
            }
        }
        for (var cell of cells) {
            validateCell(cell)
        }
    }
    function validateCell(cell) {
        if (getClass(cell) != "solid") {
            var valids = validNumbers(cell)
            var val = getValue(cell)
            if (val == null) {
                setClass(cell, "empty")
                return null
            }
            else {
                if (valids.length == 1 & valids[0] == val) {
                    setClass(cell, "valid")
                    return true
                }
                else if (!valids.includes(val)) {
                    setClass(cell, "invalid")
                    return false
                }
            }
        }
    }
    function _setValue(cell,val){
        cell.data("val", val)
        $("div span",cell).text(val ? val.toString() : " ")

        return cell
    }
    function setValue(cell, val) {
        if (getClass(cell) == "solid")
            console.log("solid")
        else{
            _setValue(cell,val)
            validateAll()
            save(grid)
        }
        return cell

    }
    function getValue(cell) {
        return cell.data("val")
    }
    function getCell(x, y) {
        return grid [x][y]
    }
    function setClass(cell, cls) {
        cell.removeClass("valid invalid empty solid possible")
        if (cls==null)
            cls="possible"
        cell.addClass(cls)

        return cell
    }
    function getClass(cell) {
        var clss = ["valid", "invalid", "empty", "solid", "possible"]
        for (var cls of clss) {
            if (cell.hasClass(cls))
                return cls
        }
    }
    function advanceTime(dt){
        console.assert(dt!=null)
        time=time+dt
        var date = new Date(0,0,0,0,0,time)
        // date.setSeconds(time)
        $(".time").text(date.getHours()+":"+date.getMinutes()+":"+date.getSeconds())
        save(grid)
    }
    function setupHtml() {
        $("body").append(
            $("<button>Very Easy</button>").click(function () {
                generate(difficulty.very_easy)
            }),
            $("<button>Easy</button>").click(function () {
                generate(difficulty.easy)
            }),
            $("<button>Normal</button>").click(function () {
                generate(difficulty.normal)
            }),
            $("<button>Hard</button>").click(function () {
                generate(difficulty.hard)
            }),
            $("<button>Very Hard</button>").click(function () {
                generate(difficulty.very_hard)
            })
        )
        $(".btn_generate").click(generate)
        $("body").append(($("<button>Validate</button>").addClass("btn_validate")))
        $(".btn_validate").click(validateAll())
        $("body").append($("<button>Solve</button>").addClass("btn_solve"))
        $(".btn_solve").click(solve)
        $("body").append($("<button>Reset</button>").addClass("btn_reset"))
        $(".btn_reset").click(clearAll)
        var row, table, cell
        $("body").append($("<span></span>").addClass("time"))
        setInterval(function(){advanceTime(1)},1000)
        advanceTime(0)
        $("body").append(table = $("<table></table>"))
        for (var i of _.range(9)) {
            table.append(row = $("<tr></tr>"))
            grid.push([])
            for (var j of _.range(9)) {
                row.append(cell = $("<td><div><span></span></div></td>")
                    .addClass("cell")
                    .data("x", i)
                    .data("y", j)
                    .data("pos", [i, j])
                    .data("val", null)

                )
                grid[i].push(cell)
                cells.push(cell)

            }
        }

        $(".cell").click(function () {
            var cell = $(this)
            if (!(cell.hasClass("selected"))) {
                $(".selected").removeClass("selected")
                cell.addClass("selected")
            }
        })
        $("body").keydown(function (e) {
            var cell = $(".selected")
            if (cell.length!=0) {
                var [x,y] = [cell.data("x"), cell.data("y")]

                var num = parseInt(e.key)
                if (num != null & num > 0 & num < 10) {
                    setValue(getCell(x, y), num)
                }
                if (e.key == "Delete" | e.key == "Backspace") {
                    setValue(getCell(x, y), null)
                }
                var [dx,dy] = [0,0]
                if (e.key=="ArrowLeft")
                    dx=dx-1
                if (e.key=="ArrowRight")
                    dx=dx+1
                if (e.key=="ArrowUp")
                    dy=dy-1
                if (e.key=="ArrowDown")
                    dy=dy+1
                if (dx!=0|dy!=0){
                    var [x,y]=cell.data("pos")
                    x=x+dy
                    y=y+dx
                    var cell = getCell(x,y)
                    if (cell!=null)
                        cell.click()
                }
            }
        })
    }

    function setupValues() {
        if(load()==false){
            generate(difficulty.normal)
            getCell(0,0).click()
            // solve()
        }

    }
    function save(grid){
        console.assert(grid!=null)
        var grid_data = []
        for (var i in grid){
            var col_data = []
            for (var cell of grid[i]){
                col_data.push([cell.data("val"),cell.hasClass("solid")])
            }
            grid_data.push(col_data)
        }
        localStorage.setItem("data",JSON.stringify({
            "version":version,
            "select":$(".selected").data("pos"),
            "grid":grid_data,
            "time":time,
        }))
    }
    function load() {
        var data_source = localStorage.getItem("data")
        if (data_source!=null){
            var data = JSON.parse(data_source)
            var grid_data = data["grid"]
            clearAll(true)
            for (var i in grid_data){
                for (var j in grid_data[i]){
                    var cell = getCell(i,j)
                    var [val,solid] = grid_data[i][j]
                    _setValue(cell,val)
                    if (solid){
                        setClass(cell,"solid")
                    }
                }
            }
            validateAll()
            var select = data["select"]
            if (select){
                var [sx,sy]= select
                var selected = getCell(sx,sy)
                if(selected)
                    selected.click()
            }
            time = data["time"]
            advanceTime(0)
            save(grid)

            return true
        }
        return false

    }
    $(document).ready(setupHtml)
    $(document).ready(setupValues)
    return this
})()