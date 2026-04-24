import { z } from 'zod'

export const FieldEnum = z.enum([
  'algebraic-geometry',
  'commutative-algebra',
  'algebraic-topology',
  'number-theory',
  'complex-geometry',
])

export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')

const BaseSchema = z.object({
  title: z.string().min(1),
  slug: SlugSchema,
  field: FieldEnum,
  tags: z.array(z.string()).default([]),
  summary: z.string().min(1),
  related: z.array(z.string()).default([]),
  references: z.array(z.string()).optional(),
  concepts: z.array(z.string()).optional(),
})

export const VarietyPropertiesSchema = z.object({
  dimension: z.number().int().nonnegative().optional(),
  ambient_space: z.string().optional(),
  degree: z.number().int().positive().optional(),
  singularities: z.string().optional(),
  genus: z.number().int().nonnegative().optional(),
  is_rational: z.boolean().optional(),
  kodaira_dimension: z
    .union([z.number().int(), z.literal('-inf')])
    .nullable()
    .optional(),
  picard_group: z.string().optional(),
  hodge_numbers: z.record(z.string(), z.number().int().nonnegative()).optional(),
})

export const VarietySchema = BaseSchema.extend({
  type: z.literal('variety'),
  properties: VarietyPropertiesSchema.optional(),
})

export const ComputationSchema = BaseSchema.extend({
  type: z.literal('computation'),
  object: z.string().optional(),
  computes: z.string().min(1),
  techniques: z.array(z.string()).default([]),
})

export const CounterexampleSchema = BaseSchema.extend({
  type: z.literal('counterexample'),
  refutes: z.string().min(1),
})

export const ExampleFrontmatterSchema = z.discriminatedUnion('type', [
  VarietySchema,
  ComputationSchema,
  CounterexampleSchema,
])

export type ExampleFrontmatter = z.infer<typeof ExampleFrontmatterSchema>
export type VarietyFrontmatter = z.infer<typeof VarietySchema>
export type ComputationFrontmatter = z.infer<typeof ComputationSchema>
export type CounterexampleFrontmatter = z.infer<typeof CounterexampleSchema>

export type Example = ExampleFrontmatter & { body: string }
export type VarietyExample = VarietyFrontmatter & { body: string }
