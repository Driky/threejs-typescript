/**
 * Implementation of Hopcroft-Karp algorithm
 *
 * Reference: http://en.wikipedia.org/wiki/Hopcroft%E2%80%93Karp_algorithm
 *
 * Adapted from
 * https://github.com/pierre-dejoue/kart-match/blob/master/src/fr/neuf/perso/pdejoue/kart_match/HopcroftKarp.java
 */

// todo: make faster!

export class HopcroftKarp {

    // The Hopcroft-Karp algorithm
    public static findMaximumMatching(graph:Map<number, Array<number>>):Map<number, number> {
        // Local variables:
        // The first step of the Hopcroft-Karp algorithm consists in building a list alternating
        // U-layers and V-layers. The current U/V-layer being processed by the algorithm is stored in
        // hash maps current_layer_u and current_layer_v. All U-layers (respectively V-layers) shall
        // be disjoint from each other. Yet there is no need to store all the layers as they are built,
        // so the algorithm only keeps track of the union of the previous U-layers and V-layers in hash
        // maps all_layers_u and all_layers_v.
        // Finally, hash map matched_v contains the temporary matching built by the algorithm. Upon
        // completion of the algorithm, it is a maximum matching.
        let current_layer_u     :Map<number, number>        = new Map<number, number>()// u --> v
        let current_layer_v     :Map<number, Array<number>> = new Map<number, Array<number>>();// v --> list of u
        let all_layers_u        :Map<number,number>         = new Map<number, number>(); // u --> v
        let all_layers_v        :Map<number, Array<number>> = new Map<number, Array<number>>(); // v --> list of u
        let matched_v           :Map<number,number>         = new Map<number, number>(); // v --> u
        let unmatched_v         :Array<number>              = new Array<number>(); // list of v

        // Loop as long as we can find at least one minimal augmenting path
        while (true) {
            let k:number = 0; // U-layers have indexes n = 2*k ; V-layers have indexes n = 2*k+1.

            // The initial layer of vertices of U is equal to the set of u not in the current matching
            all_layers_u.clear();
            current_layer_u.clear();
            for(let u of graph.keys()) {
                if(!matched_v.has(u)) {
                    current_layer_u.set(u, 0);
                    all_layers_u.set(u, 0);
                }
            }

            all_layers_v.clear();
            unmatched_v = new Array();

            // Use BFS to build alternating U and V layers, in which:
            // - The edges between U-layer 2*k and V-layer 2*k+1 are unmatched ones.
            // - The edges between V-layer 2*k+1 and U-layer 2*k+2 are matched ones.

            // While the current layer U is not empty and no unmatched V is encountered
            while(!(current_layer_u.size == 0) && (unmatched_v.length == 0)) {
                //Log.d("HopcroftKarp.Algo", "current_layer_u: " + current_layer_u.toString());

                // Build the layer of vertices of V with index n = 2*k+1
                current_layer_v.clear();
                for (let it of current_layer_u.keys()) {
                    let u:number = it;
                    for(let v of graph.get(u)) {
                        if(!all_layers_v.has(v)) { // If not already in the previous partitions for V
                            let entry:Array<number>  = current_layer_v.get(v);
                            if (entry == null) {
                                entry = new Array();
                                current_layer_v.set(v, entry);
                            }
                            entry.push(u);
                            // Expand of all_layers_v is done in the next step, building the U-layer
                        }
                    }
                }

                k++;
                // Build the layer of vertices of U with index n = 2*k
                current_layer_u.clear();
                for(let v of current_layer_v.keys()) {
                    all_layers_v.set(v, current_layer_v.get(v)); // Expand the union of all V-layers to include current_v_layer

                    // Is it a matched vertex in V?
                    if(matched_v.has(v)) {
                        let u:number = matched_v.get(v);
                        current_layer_u.set(u, v);
                        all_layers_u.set(u, v); // Expand the union of all U-layers to include current_u_layer
                    } else {
                        // Found one unmatched vertex v. The algorithm will finish the current layer,
                        // then exit the while loop since it has found at least one augmenting path.
                        unmatched_v.push(v);
                    }
                }
            }

            // After the inner while loop has completed, either we found at least one augmenting path...
            if(!(unmatched_v.length !== 0)) {
                for(let v of unmatched_v) {
                    // Use DFS to find one augmenting path ending with vertex V. The vertices from that path, if it
                    // exists, are removed from the all_layers_u and all_layers_v maps.
                    if(k >= 1) {
                        HopcroftKarp.recFindAugmentingPath(v, all_layers_u, all_layers_v, matched_v, (k-1)); // Ignore return status
                    } else {
                        //throw new ArithmeticException("k should not be equal to zero here.");
                    }
                }
            } else { // ... or we didn't, in which case we already got a maximum matching for that graph
                break;
            }
        } // end while(true)

        // compute the result (reversed)
        let result:Map<number, number>  = new Map<number, number>();
        for (let it of matched_v.keys()) {
            result.set(matched_v.get(it), it);
        }

        return result;
    }

    // Recursive function used to build an augmenting path starting from the end node v.
    // It relies on a DFS on the U and V layers built during the first phase of the algorithm.
    // This is by the way this function which is responsible for most of the randomization
    // of the output.
    // Returns true if an augmenting path is found.
    private static recFindAugmentingPath(v:number, all_layers_u:Map<number, number> ,
                                                 all_layers_v:Map<number, Array<number>>, matched_v:Map<number, number>, k:number):boolean {
        if (all_layers_v.has(v)) {
            let list_u:Array<number> = all_layers_v.get(v);

            for(let u of list_u) {
                if(all_layers_u.has(u)) {
                    let prev_v:number = all_layers_u.get(u);

                    // If the path ending with "prev_v -> u -> v" is an augmenting path
                    if(k == 0 || HopcroftKarp.recFindAugmentingPath(prev_v, all_layers_u, all_layers_v, matched_v, (k-1))) {
                        matched_v.set(v, u); // Edge u -> v replaces the previous matched edge connected to v.
                        all_layers_v.delete(v); // Remove vertex v from all_layers_v
                        all_layers_u.delete(u); // Remove vertex u from all_layers_u
                        return true;
                    }
                }
            }
        }

        return false; // No augmenting path found
    }

}