import gradio as gr
import subprocess
import os
import tempfile
import re

def telecharger_mp3_youtube(url_video):
    """
    Télécharge l'audio d'une vidéo YouTube au format MP3 en utilisant yt-dlp.

    Args:
        url_video (str): L'URL de la vidéo YouTube.

    Returns:
        tuple: (statut, résultat) où statut est un booléen indiquant le succès et résultat est soit le chemin du fichier MP3, soit un message d'erreur
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
                    return True, mp3_path
            return False, "Erreur: Fichier MP3 non trouvé après conversion"
        else:
            error_output = stderr.decode('utf-8', errors='ignore')

            # Vérifier si c'est une erreur d'authentification YouTube
            if "Sign in to confirm you're not a bot" in error_output or "cookies" in error_output:
                return False, "YouTube requiert une authentification pour cette vidéo. Cette application ne peut pas télécharger les vidéos qui nécessitent une connexion. Essayez une autre vidéo ou utilisez l'application en local."

            return False, f"Erreur lors du téléchargement: {error_output}"

    except Exception as e:
        return False, f"Une erreur s'est produite: {str(e)}"

# Interface Gradio
def youtube_to_mp3(youtube_url):
    if not youtube_url:
        return "Veuillez entrer une URL YouTube valide"

    # Vérifier si l'URL est valide
    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.+$', youtube_url):
        return "URL YouTube invalide. Veuillez entrer une URL au format https://www.youtube.com/watch?v=..."

    success, result = telecharger_mp3_youtube(youtube_url)

    if success and os.path.isfile(result):
        return result
    else:
        return result  # C'est un message d'erreur

# Création de l'interface
demo = gr.Interface(
    fn=youtube_to_mp3,
    inputs=gr.Textbox(label="URL de la vidéo YouTube", placeholder="https://www.youtube.com/watch?v=..."),
    outputs=gr.Textbox(label="Résultat"),
    title="YouTube vers MP3",
    description="""Téléchargez l'audio d'une vidéo YouTube au format MP3.

**Note importante**: En raison des restrictions de YouTube, certaines vidéos nécessitant une authentification ne peuvent pas être téléchargées dans cet environnement Hugging Face Spaces. Pour une utilisation complète, exécutez cette application localement ou dans Google Colab.""",
    examples=[["https://www.youtube.com/watch?v=jNQXAC9IVRw"]]  # Première vidéo YouTube (Me at the zoo)
)

if __name__ == "__main__":
    # Paramètres spécifiques pour Hugging Face Spaces
    demo.launch(server_name="0.0.0.0", 
                server_port=7860, 
                share=False,
                ssr_mode=False)
