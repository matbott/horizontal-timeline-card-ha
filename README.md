# Horizontal Timeline Card

Una tarjeta de Lovelace para Home Assistant que muestra eventos de un calendario en una línea de tiempo horizontal.

<img width="517" height="227" alt="image" src="https://github.com/user-attachments/assets/bbb459d1-c8c1-42de-8e45-1f262af8e9ed" />
  ## Características

* Visualiza eventos en un rango de fechas sobre una línea de tiempo horizontal.
* Personalizable: cambia colores, posición de etiquetas, y más.
* Muestra un marcador para el día actual.
* Permite iconos y colores personalizados por evento a través de la descripción del calendario.

## Instalación

### Vía HACS (Recomendado)

1.  Asegúrate de tener HACS instalado.
2.  (Próximamente) Busca "Horizontal Timeline Card" en la sección de Frontend y haz clic en instalar.
3.  (Por ahora) Añade este repositorio como un repositorio personalizado en los ajustes de HACS.

## Configuración

Añade una tarjeta manual a tu panel de Lovelace con la siguiente configuración:

```yaml
type: custom:horizontal-timeline-card
title: Hoja de Ruta 2025
entity: calendar.proyectos
start_date: '2025-01-01'
end_date: '2025-12-31'
# --- Opciones Adicionales ---
show_names: true
labels_position: top
line_color: '#3498db'
dot_color: '#e74c3c'
today_color: '#f1c40f'
