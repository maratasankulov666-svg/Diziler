import sys;sys.path.insert(0,"/home/user/Diziler/survival/engine")
from background import background
S={"b1_street":"quiet city street at the start of light rain, wet asphalt, small puddles, parked cars, grey overcast sky, shop fronts",
   "b2_flooded":"city street flooded with brown water up to the car windows, rain falling, abandoned cars, shop signs, gloomy sky",
   "b3_market":"inside a dim supermarket at night, half empty shelves, wet floor, flickering emergency lights, cool blue light",
   "b4_roof":"flat rooftop of an apartment building surrounded by flood water, city half submerged, heavy rain, dark grey clouds, water tanks",
   "b5_night":"flat rooftop at night in heavy rain overlooking a flooded dark city, distant submerged buildings, deep blue night, one tiny distant light"}
for k,s in S.items(): background(s,f"{k}.png",seed=21); print(k,flush=True)
