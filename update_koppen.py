from PIL import Image
import numpy as np

im = Image.open('images/koppen.png')
im = im.convert('RGB')
W = 150

data = np.array(im)
colors = {}

# for i in range(data.shape[0]):
#     for j in range(data.shape[1]):
#         color = data[i,j,0], data[i,j,1], data[i,j,2]
#         if not color in colors:
#             print(color[:3])
#             colors[color] = color
# print(len(colors))
# print(colors)

colors[(0,0,0)] = (50,130,230,255) # ocean
colors[(178,178,178)] = (93,85,52) # ET (tundra)
colors[(102,102,102)] = (255,255,255) # EF (ice cap)

# Group D: split by temperature
colors[(0,255,255)] = (63,150,82) # Dfa (humid continental)
colors[(55,200,255)] = colors[(0,255,255)] # Dfb (humid continental)
colors[(170,175,255)] = colors[(0,255,255)] # Dwa (humid continental)
colors[(89,120,220)] = colors[(0,255,255)] # Dwb (humid continental)
colors[(255,0,255)] = colors[(0,255,255)] # Dsa (humid continental)
colors[(200,0,200)] = colors[(0,255,255)] # Dsb (humid continental)
colors[(0,125,125)] = (53,125,72) # Dfc (subarctic)
colors[(75,80,179)] = colors[(0,125,125)] # Dwc (subarctic)
colors[(150,50,150)] = colors[(0,125,125)] # Dsc (subarctic)
colors[(0,70,95)] = colors[(178,178,178)] # Dfd (cold subarctic)
colors[(150,100,150)] = colors[(178,178,178)] # Dsd (cold subarctic)
colors[(50,0,135)] = colors[(178,178,178)] # Dwd (cold subarctic)

# Group C: split by precipitation
colors[(200,255,80)] = (63,155,52) # Cfa (humid subtropical)
colors[(100,255,80)] = colors[(200,255,80)] # Cfb (warm oceanic)
colors[(50,200,0)] = colors[(200,255,80)] # Cfc (cold oceanic)
colors[(255,255,0)] = (110,145,12) # Csa (mediterranean)
colors[(200,200,0)] = colors[(255,255,0)] # Csb (mediterranean)
colors[(150,150,0)] = colors[(255,255,0)] # Csc (mediterranean)
colors[(150,255,150)] = colors[(255,255,0)] # Cwa (dry-winter humid subtropical)
colors[(100,200,100)] = colors[(255,255,0)] # Cwb (warm oceanic)
colors[(50,150,50)] = colors[(255,255,0)] # Cwc (cold oceanic)

# Group B: split by all
colors[(255,0,0)] = (250,225,189) # BWh (hot desert) 0.837
colors[(255,150,150)] = (228,186,142) # BWk (cold desert)
colors[(245,165,0)] = (160,165,80) # BSh (hot semiarid)
colors[(255,220,100)] = (144,148,77) # BSk (cold semiarid)

# Group A: split by precipitation
colors[(0,0,255)] = (10,135,42) # Af (tropical rainforest)
colors[(0,120,255)] = (33,145,62) # Am (tropical monsoon)
colors[(70,170,250)] = colors[(0,120,255)] # Aw/As (tropical savanna)

m = np.zeros((data.shape[0], data.shape[1], 4))
m[:,:,3] = 255

b_raw = np.array(Image.open('images/bluemarble.png').resize((m.shape[1], m.shape[0])).convert('RGB'))
b = b_raw[:,:,2] - b_raw[:,:,1]
# b[b != 51] = 0
b[b == 150] = 0
for i in range(27, 52):
    b[b == i] = 150
b[b != 150] = 0
b = b.astype(np.float64)
b = np.stack([b,b,b], axis=2)
# b += data*0.5
# b *= 255/np.max(b)
b = b.astype(np.uint8)

for i in range(data.shape[0]):
    for j in range(data.shape[1]):
        color = data[i,j,0], data[i,j,1], data[i,j,2]
        if b[i,j,0] == 150:
            color = (0,0,0)
        color = colors[color]
        for k in range(3):
            m[i,j,k] = color[k]
        if len(color) == 4:
            m[i,j,3] = color[3]
        else:
            m[i,j,3] = 255
m = m.astype(np.uint8)

w = np.copy(m)
w = np.sum(w, axis=2)
w[w != 50+130+230+255] = 1
w[w == 50+130+230+255] = W
w[w != W] = 0
w = np.stack([w,w,w], axis=2)
w = w.astype(np.uint8)
b[w == 150] = 150

e = np.array(Image.open('images/elevation.png').resize((w.shape[1], w.shape[0])).convert('RGB'))
e = e.astype(np.float64)
e[w == W] = 255*0.56
e -= np.min(e)
e *= 255/np.max(e)
e = e.astype(np.uint8)

l = np.array(Image.open('images/lights.jpg').convert('RGB'))
l = l.astype(np.float64)
# l -= b_raw*0.1
l[l < 0] = 0
l = (l[:,:,0] + l[:,:,1])/2.0
l[l < 77] = 0
l *= 255/np.max(l)
l = np.stack([l,l,l], axis=2)
l = l.astype(np.uint8)

im2 = Image.fromarray(m)
im2.show()
im2.save("images/new_koppen.png")

# im3 = Image.fromarray(w)
# im3.show()
# im3.save("images/water.jpg")

im4 = Image.fromarray(e)
im4.show()
# im4.save("images/new_elevation.png")

im4_l = Image.fromarray(e[:,:e.shape[1]//2,:])
im4_l.save("images/elevation_l.png")
im4_r = Image.fromarray(e[:,e.shape[1]//2:,:])
im4_r.save("images/elevation_r.png")

im5 = Image.fromarray(b)
im5.show()
im5.save("images/new_blank.png")
im5_l = Image.fromarray(b[:,:b.shape[1]//2,:])
im5_l.save("images/water_l.png")
im5_r = Image.fromarray(b[:,b.shape[1]//2:,:])
im5_r.save("images/water_r.png")

im6 = Image.fromarray(l)
# im6.show()
im6.save("images/city.png")

# Image.MAX_IMAGE_PIXELS = 933120000+1
# bm = np.array(Image.open('images/bluemarble_big.png').resize((32768,16384)).convert('RGB'))
# bm_l = bm[:,:16384,:]
# bm_r = bm[:,16384:,:]
# print(bm_l.shape)
# print(bm_r.shape)
# im7 = Image.fromarray(bm_l)
# im7.save("images/bm_p2_l.png")
# im8 = Image.fromarray(bm_r)
# im8.save("images/bm_p2_r.png")