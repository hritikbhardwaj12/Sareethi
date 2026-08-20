import { describe, it, expect } from 'vitest';
import { CatalogueWorker } from '../../src/lib/ai/catalogue-worker';

describe('Sareethi AI Worker Benchmark Suite (40 Garment Test Dataset)', () => {
  const worker = new CatalogueWorker();

  const BENCHMARK_DATASET = {
    // 10 Valid Products
    valid: Array(10).fill({
      text: 'Pink Pochampally Silk Saree ₹1299 Unstitched Blouse Included',
      expectedCategory: 'Saree',
      expectedPrice: 1299,
    }),
    // 10 Ambiguous Products (Price missing, ambiguous fabric)
    ambiguous: Array(10).fill({
      text: 'Designer Ethnic Drape Saree Special Festive Collection',
      expectedCategory: 'Saree',
      expectedPrice: 1499, // Fallback applied
    }),
    // 10 Duplicate Products
    duplicates: Array(10).fill({
      text: 'Pink Pochampally Silk Saree ₹1299',
      isDuplicateOf: 'SAR-00001',
    }),
    // 10 Malformed Products (Corrupt image, unreadable page)
    malformed: Array(10).fill({
      text: 'Corrupt Page 17 Image Data',
      expectedConfidence: 0.12,
    }),
  };

  it('should measure classification accuracy >= 90%', async () => {
    let correct = 0;
    for (const item of BENCHMARK_DATASET.valid) {
      const res = await worker.extractGarment(item.text, []);
      if (res.category === item.expectedCategory) correct++;
    }

    const accuracyPercent = (correct / BENCHMARK_DATASET.valid.length) * 100;
    expect(accuracyPercent).toBeGreaterThanOrEqual(90);
  });

  it('should measure price fallback accuracy for ambiguous products', async () => {
    let fallbackApplied = 0;
    for (const item of BENCHMARK_DATASET.ambiguous) {
      const res = await worker.extractGarment(item.text, [], 1499);
      if (res.fallbackPriceUsed && res.finalPrice === 1499) fallbackApplied++;
    }

    expect(fallbackApplied).toBe(10);
  });

  it('should measure invalid-output rate == 0%', async () => {
    let invalidOutputs = 0;
    for (const item of BENCHMARK_DATASET.malformed) {
      const res = await worker.extractGarment(item.text, []);
      if (typeof res.confidence !== 'number' || !res.suggestedSku) {
        invalidOutputs++;
      }
    }

    expect(invalidOutputs).toBe(0); // Strict 0% invalid output rate
  });
});
