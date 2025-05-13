
import gradio as gr
import subprocess
import os
import tempfile

def telecharger_mp3_youtube(url_video):
    """
    Télécharge l'audio d'une vidéo YouTube au format MP3 en utilisant yt-dlp.
    
    Args:
        url_video (str): L'URL de la vidéo YouTube.
    
    Returns:
        str: Chemin vers le fichier MP3 téléchargé ou message d'erreur
    """
    try:
        # Créer un dossier temporaire pour le téléchargement
        temp_dir = tempfile.mkdtemp()
        
        # Options pour yt-dlp
        nom_fichier_template = os.path.join(temp_dir, "%(title)s.%(ext)s")
        
        commande = [
            "yt-dlp",
            "-x",  # Extraire l'audio
            "--audio-format", "mp3",
            "--audio-quality", "0", # 0 pour la meilleure qualité VBR
            "-o", nom_fichier_template,
            url_video
        ]
        
        # Exécuter la commande
        process = subprocess.Popen(commande, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            # Trouver le fichier MP3 dans le dossier temporaire
            for file in os.listdir(temp_dir):
                if file.endswith(".mp3"):
                    mp3_path = os.path.join(temp_dir, file)
                    return mp3_path
            return "Erreur: Fichier MP3 non trouvé après conversion"
        else:
            error_output = stderr.decode('utf-8', errors='ignore')
            return f"Erreur lors du téléchargement: {error_output}"
            
    except Exception as e:
        return f"Une erreur s'est produite: {str(e)}"

# Interface Gradio
def youtube_to_mp3(youtube_url):
    if not youtube_url:
        return "Veuillez entrer une URL YouTube valide"
    
    result = telecharger_mp3_youtube(youtube_url)
    
    if os.path.isfile(result):
        return result
    else:
        return result  # C'est un message d'erreur

# Création de l'interface
demo = gr.Interface(
    fn=youtube_to_mp3,
    inputs=gr.Textbox(label="URL de la vidéo YouTube", placeholder="https://www.youtube.com/watch?v=..."),
    outputs=gr.Audio(label="Fichier MP3 téléchargé"),
    title="YouTube vers MP3",
    description="Téléchargez l'audio d'une vidéo YouTube au format MP3",
    examples=[["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]]
)

if __name__ == "__main__":
    demo.launch()
