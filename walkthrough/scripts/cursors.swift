// Writes the system arrow and pointing-hand cursors as PNGs, 8× their point size.
//   swiftc scripts/cursors.swift -o /tmp/cursors && /tmp/cursors cursors
import AppKit

_ = NSApplication.shared // cursor images need the app connection
let folder = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "cursors"
try FileManager.default.createDirectory(atPath: folder, withIntermediateDirectories: true)
for (name, cursor) in [("arrow", NSCursor.arrow), ("hand", NSCursor.pointingHand)] {
    let image = cursor.image, scale: CGFloat = 8
    var rect = NSRect(x: 0, y: 0, width: image.size.width * scale, height: image.size.height * scale)
    guard let best = image.representations.max(by: { $0.pixelsWide < $1.pixelsWide }),
          let drawn = best.cgImage(forProposedRect: nil, context: nil, hints: nil) ?? image.cgImage(forProposedRect: &rect, context: nil, hints: nil)
    else { fatalError("no image for \(name): \(image.representations)") }
    let width = Int(rect.width), height = Int(rect.height)
    let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.interpolationQuality = .high
    context.draw(drawn, in: CGRect(x: 0, y: 0, width: width, height: height))
    let png = NSBitmapImageRep(cgImage: context.makeImage()!).representation(using: .png, properties: [:])!
    try png.write(to: URL(fileURLWithPath: "\(folder)/\(name).png"))
    print("\(name): \(Int(image.size.width))x\(Int(image.size.height))pt, hotspot \(cursor.hotSpot.x),\(cursor.hotSpot.y), \(width)x\(height)px")
}
