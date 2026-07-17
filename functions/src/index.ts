import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { runOrchestration, OrchestratorInput } from './orchestrator';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

export const askStadWay = onCall({
  cors: true
}, async (request) => {
  const data = request.data as OrchestratorInput;
  if (!data.fanProfile || !data.venueState || !data.question) {
    throw new HttpsError('invalid-argument', 'Missing required arguments: fanProfile, venueState, or question');
  }

  try {
    const result = await runOrchestration(data);
    
    // Save to decisions collection
    const decisionDoc = {
      fanId: data.fanProfile.id,
      agentTrail: result.agentTrail,
      finalRecommendation: result.finalRecommendation,
      confidence: result.confidence,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('decisions').add(decisionDoc);
    
    return {
      id: docRef.id,
      ...decisionDoc
    };
  } catch (err: unknown) {
    console.error('askStadWay execution error:', err);
    throw new HttpsError('internal', err instanceof Error ? err.message : 'Orchestration failed');
  }
});
