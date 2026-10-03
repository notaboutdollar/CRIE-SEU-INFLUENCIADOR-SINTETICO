/**
 * Templates do prompt "Gerar imagem com IA".
 *
 * O "esqueleto fixo" captura a vibe das referências: character reference sheet
 * fotorrealista com polimento 3D (Unreal Engine 5), fundo cinza de estúdio,
 * pose neutra, luz difusa, 5 views de corpo em cima + 3-4 closes embaixo.
 *
 * Placeholders em cada template:
 *   {{nome}}
 *   {{descricao}}   descrição do personagem montada a partir da ficha
 *   {{negativos}}   negativos extras vindos da ficha (visual.negativos)
 *
 * Edite livremente. Qualquer campo novo em data/perguntas.ts que faça parte do
 * visual pode ser incluído em extractDescricaoVisual (lib/prompts/gerar-imagem.ts).
 */

export const IMAGEM_NEUTRO = `Character reference sheet of {{nome}}, hyperrealistic 3D photoreal rendering.

LAYOUT
Top row — 5 full-body views in a horizontal strip, left to right:
1) front view
2) three-quarter front
3) side profile
4) three-quarter back
5) back view
All at the same scale, same eye-level camera height, same lighting.

Thin black dividing line between rows.

Bottom row — 3 to 4 head-and-shoulders closeups at varied angles:
front, three-quarter, profile, and one subtle expression closeup.

STUDIO
Flat neutral grey backdrop (#B5B5B5 to #CCCCCC).
Soft diffused key light with subtle fill, even catalog-style illumination.
No harsh shadows, minimal soft contact shadow on floor.
50-85mm equivalent lens, minimal depth of field.

POSE
Neutral stance, arms relaxed at the sides, straight posture.
Neutral or slightly serious expression.
Consistent character identity across every panel — same body, same face,
same clothes, same props.

CHARACTER
{{descricao}}

STYLE
Photoreal with AAA game-character polish (Unreal Engine 5 quality).
Detailed skin texture with natural micro-pores and subtle imperfections.
Realistic fabric with proper weight and drape.
Idealized but believable features. Any exaggerated or caricatural traits of
the character must be preserved and rendered with photographic fidelity.

AVOID
No text or logos (unless explicitly on the clothing), no watermark,
no extra limbs, no extra fingers, no inconsistent character between panels,
no cartoon or anime styling, no blur, no low-res artifacts.
{{negativos}}
`;

export const IMAGEM_MIDJOURNEY = `character reference sheet of {{nome}}, {{descricao}}, turnaround model sheet, top row five full body views (front, three-quarter front, side profile, three-quarter back, back view) at same scale and eye-level, thin black divider, bottom row three to four head-and-shoulders closeups at varied angles, neutral grey studio backdrop, soft diffused catalog lighting, hyperrealistic 3D photoreal, Unreal Engine 5 character polish, detailed skin texture, realistic fabric, neutral stance arms at sides, consistent character identity, 50-85mm lens --ar 1:1 --style raw --v 6.1 --no text, logos, watermark, extra limbs, extra fingers, cartoon, anime, blur, low-res{{negativos}}
`;

export const IMAGEM_FLUX = `Positive:
character reference sheet of {{nome}}. Top row: 5 full-body views (front, 3/4 front, side profile, 3/4 back, back) aligned at same eye-level and scale. Bottom row: 3-4 head-and-shoulders closeups in varied angles. Thin horizontal black divider between rows. Neutral grey studio backdrop (#B5B5B5–#CCCCCC). Soft diffused key light + fill, catalog-style illumination, minimal contact shadow. 50-85mm lens, minimal DOF.

Pose: neutral stance, arms relaxed at sides, straight posture, neutral expression. Consistent character identity in every panel: same body, same face, same clothes.

Character: {{descricao}}

Style: photoreal with AAA game-character polish (Unreal Engine 5), detailed skin micro-pores, realistic fabric weight, idealized but believable, caricatural traits preserved with photographic fidelity.

Negative:
text, logos (unless on clothing), watermark, extra limbs, extra fingers, inconsistent character between panels, cartoon, anime, concept-art styling, painterly, blurry, low-res, artifacts, deformed anatomy{{negativos}}
`;
