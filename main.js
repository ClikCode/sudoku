$(document).ready(function () {
    var row, table, cell
    $("body").append(table = $("<table></table>"))
    for (var i of _.range(9)) {
        table.append(row = $("<tr></tr>"))
        for (var j of _.range(9)) {
            row.append(cell = $("<td></td>")
                .addClass("cell")
                .data("x", i)
                .data("y", j)
                .data("val", null)
            )
        }
    }

    $(".cell:not(.selected):not(.solid)").click(function () {
        $(".selected").removeClass("selected")
        var cell = $(this).addClass("selected")
    })
    $(document).on("keydown",".selected:not(solid):not(valid)",function (e) {
        var cell = $(this)
        var [x,y] = [cell.data("x"), cell.data("y")]

        var num = parseInt(e.key)
        if (num != null & num > 0 & num < 10) {
            setCellValue(x, y, num)
        }
        else if (e.key == "Delete" | e.key == "Backspace") {
            setCellValue(x, y, null)
        }
    })
    generateSeedValues()
    generateSolution()
    for (var x of _.range(9)){
        for (var y of _.range(9)){
            if (validateCell(x, y)==true){
                getCell(x,y).addClass("valid")
            }
        }
    }
})
function getAvailableSquareNumbers(sx, sy) {
    var valids = _.range(1, 10)
    for (var x of _.range(sx * 3, sx * 3 + 3)) {
        for (var y of _.range(sy * 3, sy * 3 + 3)) {
            var val = getCellValue(x, y)
            if (val != null) {
                valids.splice(valids.indexOf(val), 1)
            }
        }
    }
    return valids
}
function generateSeedValues() {
    for (var k of _.range(0, 9, 3)) {
        var vals = _.shuffle(_.range(1, 10))
        for (var i of _.range(3)) {
            for (var j of _.range(3)) {
                setCellValue(k + i, k + j, vals.pop())
            }
        }
    }
}
function shiftArray(arr, index, shift) {
    return (arr
            .slice(0, index)
            .concat([arr[index + shift],])
            .concat(arr.slice(index, index + shift))
            .concat(arr.slice(index + shift))
    )
}
function generateSolution() {
    var points = []
    // Prepare
    for (var x of _.range(9)) {
        var col = []
        for (var y of _.range(9)) {
            var v = getCellValue(x, y)
            col.push(v)
            if (v == null) {
                points.push([x, y])
            }
        }
    }
    // Process
    var used = [[]]
    var index = 0
    while (index < points.length) {
        // console.log(used.toString())
        var [x,y] = points[index]
        clearCellValue(x, y)

        var vals = _.difference(
            getCellValidNumbers(x,y),
            used[index]
        )
        vals
        if (vals.length > 0) {
            var val = _.shuffle(vals)[0]
            setCellValue(x, y, val)
            used[index].push(val)

            index = index + 1
            used.push([])
        }
        else {
            clearCellValue(x, y)
            index = index - 1
            used.pop()

        }
    }
    index
}
function getCellValidNumbers(x, y) {
    var vals = _.range(1,10)
    for (var i of _.range(9)){
        var oval = getCellValue(x,i)
        if (oval!=null)
            vals = _.difference(vals,[oval,])
        var oval = getCellValue(i,y)
        if (oval!=null)
            vals = _.difference(vals,[oval,])
    }
    for (var i of _.range(Math.floor(x/3)*3,Math.floor(x/3)*3+3)){
        for (var j of _.range(Math.floor(y/3)*3,Math.floor(y/3)*3+3)){
            if ([i,j]!=[x,y]){
                var oval = getCellValue(i,j)
                if (oval!=null){
                    vals = _.difference(vals,[oval,])
                }
            }
        }
    }
    return vals
}
function validateCell(x,y){
    var val = getCellValue(x,y)
    if (val == null)
        return null
    var valids = getCellValidNumbers(x,y)
    if (valids=[val])
        return true
    else if (valids.includes(val))
        return null
    else
        return false
}

function getCell(x, y) {
    return $(".cell").filter(function () {
        var cell = $(this)
        return (cell.data("x") == x & cell.data("y") == y)
    })
}
function getCellValids(x, y) {

}
function clearCellValue(x, y) {
    getCell(x, y).data("val", null).text("")
}
function setCellValue(x, y, val) {
    return getCell(x, y).data("val", parseInt(val)).text(val.toString())
}
function getCellValue(x, y) {
    return getCell(x, y).data("val")
}
