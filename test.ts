let myAnimation = hex`010001050c0067000000fff357000000ff00006ea62850003200000100020003000400050006000700080009001402150216021702180219021a021b021c021d02280229022a022b022c022d022e022f02300231023c023d023e023f0240024102420243024402450250035103520353035403550356035703580359030000`;
let myMatrix = SmartMatrix.create(DigitalPin.P0, 10, 10, null)
basic.forever(function () {
    myMatrix.writeAnimation(myAnimation, 1000)
    myMatrix.show()
    myMatrix.scrollText(
        "Calliope",
        200,
        0,
        neopixel.colors(NeoPixelColors.Red)
    )
    for (let Index = 0; Index <= 9; Index++) {
        myMatrix.setPixel(Index, 9, neopixel.colors(NeoPixelColors.Blue))
        basic.pause(500)
        myMatrix.show()
    }
    basic.pause(5000)
    for (let Index2 = 0; Index2 <= 9; Index2++) {
        myMatrix.show()
        myMatrix.setPixel(9, Index2, neopixel.colors(NeoPixelColors.Purple))
        basic.pause(500)
    }
})
