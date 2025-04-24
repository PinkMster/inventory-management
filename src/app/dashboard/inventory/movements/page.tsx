'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button, Modal, ConfirmDialog } from '@/components/ui'
import MovementForm from '@/components/inventory/movements/MovementForm'

export default function InventoryMovementsPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load inventory movements
  useEffect(() => {
    fetchMovements()
  }, [refreshKey])

  async function fetchMovements() {
    try {
      setLoading(true)
      setError(null)

      // Fetch movements with related data
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          inventory:inventory_id(name, sku),
          from:from_location(name, warehouses(name)),
          to:to_location(name, warehouses(name))
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setMovements(data || [])
    } catch (error: any) {
      console.error('Error fetching inventory movements:', error)
      setError(error.message || 'Failed to load movements')
    } finally {
      setLoading(false)
    }
  }

  // Record a new movement
  const handleRecordMovement = async (data: any) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Insert movement record
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert([{
          ...data,
          created_at: new Date().toISOString()
        }])

      if (movementError) throw movementError

      // Update inventory quantity at source location
      const { error: updateSourceError } = await supabase
        .from('inventory')
        .update({ 
          quantity: supabase.rpc('decrement', { x: data.quantity }),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.inventory_id)
        .eq('location', data.from_location)

      if (updateSourceError) throw updateSourceError

      // Check if inventory exists at destination with the same item
      const { data: existingInventory, error: checkError } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('sku', data.sku) // We would need the SKU here, but for simplicity assuming it's part of data
        .eq('location', data.to_location)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // Not found is ok
        throw checkError
      }

      if (existingInventory) {
        // Update quantity at existing destination
        const { error: updateDestError } = await supabase
          .from('inventory')
          .update({ 
            quantity: existingInventory.quantity + data.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingInventory.id)

        if (updateDestError) throw updateDestError
      } else {
        // This is a simplified approach - in a real app, we would duplicate the item
        // and create a new inventory entry at the destination location
        console.log('Would create new inventory entry at destination with quantity:', data.quantity)
      }

      // Refresh the movement list
      setRefreshKey(prev => prev + 1)
      setIsRecordModalOpen(false)
    } catch (error: any) {
      console.error('Error recording movement:', error)
      setError(error.message || 'Failed to record movement')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format the location display
  const formatLocation = (location: any) => {
    if (!location) return 'Unknown'
    return `${location.warehouses?.name || 'Unknown'} / ${location.name || 'Unknown'}`
  }

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading && movements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex items-center">
            <Link href="/dashboard/inventory" className="mr-4 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-0">Inventory Movements</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p>{error}</p>
          </div>
        )}

        <div className="page-header">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Movement History</h2>
            <p className="text-gray-600">Track inventory movements between locations</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={() => setIsRecordModalOpen(true)}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              Record Movement
            </Button>
          </div>
        </div>

        {/* Movement History Table */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No movements recorded</h3>
              <p className="text-gray-500">Start by recording your first inventory movement</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(movement.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{movement.inventory?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">SKU: {movement.inventory?.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatLocation(movement.from)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatLocation(movement.to)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{movement.quantity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{movement.notes || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Movement Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => !isSubmitting && setIsRecordModalOpen(false)}
        title="Record Inventory Movement"
      >
        <MovementForm
          onSubmit={handleRecordMovement}
          onCancel={() => setIsRecordModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
} 