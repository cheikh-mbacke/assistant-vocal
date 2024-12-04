# Fixe les fins de ligne du script
dos2unix ./models/download-ggml-model.sh

# Rend le script exécutable
chmod +x ./models/download-ggml-model.sh

# Maintenant exécutez le script
./models/download-ggml-model.sh large-v3-turbo-q5_0



# Sur windows
cmake -B build/windows
cmake --build build/windows --config Release
.\build\windows\bin\Release\main.exe -m models/ggml-large-v3-turbo-q5_0.bin -f samples/jfk.wav

# Sur linux pour build whisper:
cmake -B build/linux
cmake --build build/linux

# Sur Macos : 
cmake -B build/macos
cmake --build build/macos