/**
 * Templates do prompt "Gerar imagem com IA".
 *
 * A vibe-alvo é "surreal character portrait meets high-fashion editorial":
 * personagens com traços intencionalmente bizarros (cabelo esculpido como
 * estrutura, proporções exageradas, acessórios teatrais, figurino absurdo)
 * MAS renderizados com fidelidade fotográfica total. Referências mentais:
 * Loewe por Juergen Teller, Comme des Garçons runway, Diane Arbus.
 *
 * CONSISTÊNCIA ENTRE RETRATO E REFERÊNCIA
 * Os dois tipos (retrato de frente / card de referência) compartilham
 * o mesmo bloco CHARACTER + SIGNATURE TRAIT + VISUAL FIDELITY + STYLE
 * + AVOID. Diferem APENAS no enquadramento / layout. Isso garante que
 * o mesmo personagem saia visualmente idêntico nos dois formatos.
 *
 * Placeholders:
 *   {{nome}}       nome do personagem (ou "the character")
 *   {{descricao}}  descrição vinda da ficha + ideia-livre do usuário
 *   {{negativos}}  negativos extras da ficha (visual.negativos)
 *
 * Editar livremente; qualquer campo novo em data/perguntas.ts que seja
 * visual pode entrar em extractDescricaoVisual (lib/prompts/gerar-imagem.ts).
 */

/* ================================================================== */
/* Shared blocks — identical wording in retrato & referência           */
/* ================================================================== */

const SHARED_CHARACTER = `CHARACTER
{{descricao}}`;

const SHARED_TRAIT = `SIGNATURE EXAGGERATED TRAIT (NON-NEGOTIABLE)
This is NOT a safe, generic, or stock-photo look. The character MUST carry at least one striking, unforgettable visual trait that pushes well beyond everyday realism. Examples: an impossible hair sculpture (towering, geometric, or structural), surreal body proportions (elongated neck, oversized hands, extreme height ratio), a theatrical accessory (giant moustache, oversized hat, ear-protectors, bejeweled collar), an elaborate anachronistic or editorial costume (velvet, brocade, high-fashion runway piece), or an extreme pattern/colour combination.
- If the CHARACTER description above already names such a trait, amplify it to the extreme and make it the focal point.
- If no bizarre trait is named, INVENT one that fits the character's vibe and commit fully. Never default to a normal-looking person.
Intentionally bizarre styling is the point; what keeps it believable is the rendering, not the restraint.`;

const SHARED_FIDELITY = `VISUAL FIDELITY
Every clothing item, accessory, hairstyle, body feature, and colour choice MUST be derived strictly from the CHARACTER description above. Do not invent, swap, or reinterpret garments, accessories, or styling beyond what is described. The only element you may freely invent is the SIGNATURE EXAGGERATED TRAIT when none is specified — everything else must match the description exactly. The character's appearance must be identical whether rendered as a single portrait or a multi-view reference sheet.`;

const SHARED_STYLE = `STYLE
Photoreal with AAA high-fashion editorial polish.
Detailed skin texture with natural micro-pores and visible imperfections.
Realistic fabric with proper weight, drape, and material-specific detail (velvet, wool, brocade, latex, feather, denim).
Hyperreal rendering throughout — the character design can be absurd, the rendering is 100% photographic.`;

const SHARED_AVOID = `AVOID
No safe generic realism, no stock-model look, no beauty-shot sameness, no smiling, no acting pose. No text or logos (unless explicitly on the clothing), no watermark, no extra limbs, no extra fingers, no cartoon or anime styling, no painterly rendering, no blur, no low-res artifacts, no mannequin-blank faces.`;

const SHARED_STUDIO = `STUDIO
Flat neutral backdrop (soft grey #B5B5B5 to #CCCCCC, or soft white with gentle vignette — editorial studio portrait feel).
Soft diffused key light with subtle fill, even catalog-style illumination.
No harsh shadows, minimal soft contact shadow on floor. 50-85mm equivalent lens, minimal depth of field.`;

const SHARED_POSE_BASE = `POSE
Neutral stance, arms relaxed at the sides, straight posture.
Neutral or slightly serious expression. No smiling, no acting, no dynamic action poses.`;

/* shared Midjourney fragments */
const MJ_TRAIT = `signature exaggerated trait (impossible hair sculpture or theatrical accessory or elaborate anachronistic costume or surreal proportions — if not specified, invent one and commit fully)`;
const MJ_FIDELITY = `every clothing item accessory and colour must match the character description exactly — do not invent or swap garments beyond the signature trait`;
const MJ_STYLE = `intentionally bizarre styling but 100% photographic rendering, think Loewe campaign by Juergen Teller or Comme des Garcons runway or Diane Arbus editorial`;
const MJ_RENDER = `hyperrealistic photoreal, detailed skin texture with pores and imperfections, realistic fabric with material detail (velvet wool brocade latex feather denim)`;
const MJ_AVOID = `safe realism, generic model, stock photo, beauty shot, smiling, acting pose, text, logos, watermark, extra limbs, extra fingers, cartoon, anime, painterly, blur, low-res, mannequin face`;

/* shared Flux fragments */
const FLUX_TRAIT = `Signature exaggerated trait (required): the character must carry at least one striking, intentionally bizarre visual element — impossible hair sculpture, theatrical accessory, elaborate anachronistic costume, surreal body proportion, or extreme pattern/colour. If the description already names one, amplify it to the extreme. If not, invent one and commit fully. Never default to a generic/stock look.`;
const FLUX_FIDELITY_PORTRAIT = `Visual fidelity: every clothing item, accessory, hairstyle, body feature, and colour must match the character description exactly. Do not invent or swap garments beyond the signature trait. Appearance must be identical to a multi-view reference sheet of the same character.`;
const FLUX_FIDELITY_SHEET = `Visual fidelity: every clothing item, accessory, hairstyle, body feature, and colour must match the character description exactly. Do not invent or swap garments beyond the signature trait. Appearance must be identical to a single front portrait of the same character.`;
const FLUX_STYLE = `Style: photoreal with AAA high-fashion editorial polish, detailed skin micro-pores and visible imperfections, realistic fabric with material-specific detail (velvet, wool, brocade, latex, feather, denim). Design can be absurd; rendering is 100% photographic.`;
const FLUX_AVOID = `safe generic realism, stock-model look, beauty-shot sameness, smiling, acting pose, text, logos (unless on clothing), watermark, extra limbs, extra fingers, cartoon, anime, concept-art styling, painterly, blurry, low-res, artifacts, deformed anatomy, mannequin blank face`;

/* ================================================================== */
/* RETRATO DE FRENTE — single front-facing portrait                   */
/* ================================================================== */

export const RETRATO_NEUTRO = `Portrait of {{nome}}, hyperrealistic character portrait in the style of high-fashion editorial meets surreal character design. Think Loewe campaign by Juergen Teller, Comme des Garçons runway, Diane Arbus editorial — intentionally striking, never generic.

FRAMING
Single full-body front-facing portrait. Straight-on camera angle at eye level.
50-85mm equivalent lens, shallow depth of field.

${SHARED_STUDIO}

${SHARED_POSE_BASE}
Looking directly at camera.

${SHARED_CHARACTER}

${SHARED_TRAIT}

${SHARED_FIDELITY}

${SHARED_STYLE}

${SHARED_AVOID}
{{negativos}}
`;

export const RETRATO_MIDJOURNEY = `front-facing full body portrait of {{nome}}, {{descricao}}, surreal character portrait meets high-fashion editorial, ${MJ_TRAIT}, ${MJ_FIDELITY}, ${MJ_STYLE}, single portrait, straight-on camera at eye level, neutral grey or soft white studio backdrop with gentle vignette, soft diffused catalog lighting, ${MJ_RENDER}, neutral stance arms at sides, no smiling, looking at camera, 50-85mm lens --ar 2:3 --style raw --v 6.1 --no ${MJ_AVOID}{{negativos}}
`;

export const RETRATO_FLUX = `Positive:
front-facing full body portrait of {{nome}}, in the vein of high-fashion editorial x surreal character portrait (Loewe by Juergen Teller, Comme des Garcons runway, Diane Arbus). Single portrait, straight-on camera at eye level. Neutral grey or soft white studio backdrop with gentle vignette. Soft diffused key light + fill, catalog-style illumination. 50-85mm lens, shallow DOF.

Pose: neutral stance, arms relaxed at sides, straight posture, neutral or slightly serious expression. No smiling, no acting. Looking directly at camera.

Character: {{descricao}}

${FLUX_TRAIT}

${FLUX_FIDELITY_PORTRAIT}

${FLUX_STYLE}

Negative:
${FLUX_AVOID}{{negativos}}
`;

/* ================================================================== */
/* CARD DE REFERÊNCIA — 5 views + closeups                            */
/* ================================================================== */

export const IMAGEM_NEUTRO = `Character reference sheet of {{nome}}, hyperrealistic character portrait in the style of high-fashion editorial meets surreal character design. Think Loewe campaign by Juergen Teller, Comme des Garçons runway, Diane Arbus editorial — intentionally striking, never generic.

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

${SHARED_STUDIO}

${SHARED_POSE_BASE}
Consistent character identity across every panel — same body, same face, same clothes, same props.

${SHARED_CHARACTER}

${SHARED_TRAIT}

${SHARED_FIDELITY}

${SHARED_STYLE}

${SHARED_AVOID}
No inconsistent character between panels.
{{negativos}}
`;

export const IMAGEM_MIDJOURNEY = `character reference sheet of {{nome}}, {{descricao}}, surreal character portrait meets high-fashion editorial, ${MJ_TRAIT}, ${MJ_FIDELITY}, ${MJ_STYLE}, turnaround model sheet, top row five full body views (front, three-quarter front, side profile, three-quarter back, back view) at same scale and eye-level, thin black divider, bottom row three to four head-and-shoulders closeups at varied angles, neutral grey or soft white studio backdrop with gentle vignette, soft diffused catalog lighting, ${MJ_RENDER}, neutral stance arms at sides, no smiling, consistent character identity across every panel, 50-85mm lens --ar 1:1 --style raw --v 6.1 --no ${MJ_AVOID}, inconsistent character between panels{{negativos}}
`;

export const IMAGEM_FLUX = `Positive:
character reference sheet of {{nome}}, in the vein of high-fashion editorial x surreal character portrait (Loewe by Juergen Teller, Comme des Garcons runway, Diane Arbus). Top row: 5 full-body views (front, 3/4 front, side profile, 3/4 back, back) aligned at same eye-level and scale. Bottom row: 3-4 head-and-shoulders closeups in varied angles. Thin horizontal black divider between rows. Neutral grey or soft white studio backdrop with gentle vignette. Soft diffused key light + fill, catalog-style illumination, minimal contact shadow. 50-85mm lens, minimal DOF.

Pose: neutral stance, arms relaxed at sides, straight posture, neutral or slightly serious expression. No smiling, no acting. Consistent character identity in every panel: same body, same face, same clothes.

Character: {{descricao}}

${FLUX_TRAIT}

${FLUX_FIDELITY_SHEET}

${FLUX_STYLE}

Negative:
${FLUX_AVOID}, inconsistent character between panels{{negativos}}
`;
