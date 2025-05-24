export interface ReplicaCreation{
    review_id: string;
    auth_id: string;
    replica_body: string;
}

export async function createReplica(review_id: string, auth_id: string, replica_body: string){
    const body: ReplicaCreation = {review_id, auth_id, replica_body};
    const response = await fetch('api/v1/replicas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Error creating replica: ${response.statusText}`);
    }

    return await response.json();
}
