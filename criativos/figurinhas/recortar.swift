// Recorta o PNG transparente até a borda da figurinha (com folga) e salva.
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let a = CommandLine.arguments
let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil)!
let img = CGImageSourceCreateImageAtIndex(src, 0, nil)!
let pad = Int(a[3]) ?? 32
let W = img.width, H = img.height
let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: W * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
let p = ctx.data!.bindMemory(to: UInt8.self, capacity: W * H * 4)
var minX = W, minY = H, maxX = -1, maxY = -1
for y in 0..<H { for x in 0..<W where p[(y * W + x) * 4 + 3] > 6 {
  if x < minX { minX = x }; if x > maxX { maxX = x }; if y < minY { minY = y }; if y > maxY { maxY = y }
} }
guard maxX >= 0 else { print("vazio"); exit(1) }
// CGContext tem origem embaixo; a linha y do buffer é a linha y de cima para baixo da imagem desenhada
let r = CGRect(x: max(0, minX - pad), y: max(0, minY - pad), width: min(W, maxX + pad + 1) - max(0, minX - pad), height: min(H, maxY + pad + 1) - max(0, minY - pad))
let out = ctx.makeImage()!.cropping(to: r)!
let d = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(d, out, nil); CGImageDestinationFinalize(d)
print("\(out.width)x\(out.height)")
